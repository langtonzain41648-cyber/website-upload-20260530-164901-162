(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupSlider() {
        var slider = document.querySelector("[data-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = Number(dot.getAttribute("data-slide-dot") || 0);
                show(next);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var container = panel.parentElement || document;
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
            var search = panel.querySelector("[data-filter-search]");
            var region = panel.querySelector("[data-filter-region]");
            var genre = panel.querySelector("[data-filter-genre]");
            var year = panel.querySelector("[data-filter-year]");
            var count = panel.querySelector("[data-filter-count]");

            function apply() {
                var query = normalize(search && search.value);
                var regionValue = region ? region.value : "all";
                var genreValue = genre ? genre.value : "all";
                var yearValue = year ? year.value : "all";
                var visible = 0;

                cards.forEach(function (card) {
                    var title = normalize(card.getAttribute("data-title"));
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardGenre = card.getAttribute("data-genre") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var text = normalize(card.textContent) + " " + title + " " + normalize(cardRegion) + " " + normalize(cardGenre);
                    var queryMatch = !query || text.indexOf(query) !== -1;
                    var regionMatch = regionValue === "all" || cardRegion.indexOf(regionValue) !== -1;
                    var genreMatch = genreValue === "all" || cardGenre.indexOf(genreValue) !== -1;
                    var yearMatch = yearValue === "all" || cardYear.indexOf(yearValue) !== -1;
                    var shouldShow = queryMatch && regionMatch && genreMatch && yearMatch;
                    card.classList.toggle("is-hidden", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "当前显示 " + visible + " 部影片";
                }
            }

            [search, region, genre, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var hlsInstance = null;
            var initialized = false;

            if (!video || !button) {
                return;
            }

            function attachSource() {
                var source = video.getAttribute("data-src");
                if (!source || initialized) {
                    return;
                }
                initialized = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }

            function playVideo() {
                attachSource();
                video.setAttribute("controls", "controls");
                button.classList.add("is-hidden");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        video.setAttribute("controls", "controls");
                    });
                }
            }

            button.addEventListener("click", playVideo);
            player.addEventListener("click", function (event) {
                if (event.target === video && !initialized) {
                    playVideo();
                }
            });
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
            video.addEventListener("ended", function () {
                button.classList.remove("is-hidden");
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var status = document.querySelector("[data-search-status]");
        var input = document.querySelector("[data-search-page-input]");
        if (!results || !status || !window.SEARCH_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }

        function movieCard(item) {
            return [
                '<article class="movie-card">',
                '    <a class="movie-poster" href="' + item.file + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
                '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '        <span class="poster-shade"></span>',
                '        <span class="movie-year">' + escapeHtml(item.year) + '</span>',
                '        <span class="movie-play">播放</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="movie-card-meta">',
                '            <span>' + escapeHtml(item.region) + '</span>',
                '            <span>' + escapeHtml(item.type) + '</span>',
                '        </div>',
                '        <h2><a href="' + item.file + '">' + escapeHtml(item.title) + '</a></h2>',
                '        <p>' + escapeHtml(item.oneLine) + '</p>',
                '        <div class="tag-row">',
                '            <span>' + escapeHtml(item.genre) + '</span>',
                '            <span>' + escapeHtml(item.score) + '</span>',
                '        </div>',
                '    </div>',
                '</article>'
            ].join("");
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function runSearch() {
            var q = normalize(query);
            if (!q) {
                results.innerHTML = "";
                status.textContent = "请输入关键词开始搜索。";
                return;
            }
            var matched = window.SEARCH_INDEX.filter(function (item) {
                var text = normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.tags,
                    item.oneLine
                ].join(" "));
                return text.indexOf(q) !== -1;
            }).slice(0, 120);
            status.textContent = "找到 " + matched.length + " 条相关结果";
            results.innerHTML = matched.map(movieCard).join("");
        }

        runSearch();
    }

    ready(function () {
        setupMobileMenu();
        setupSlider();
        setupFilters();
        setupPlayers();
        setupSearchPage();
    });
})();
