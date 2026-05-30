(function () {
    "use strict";

    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initMobileMenu() {
        var toggle = $(".menu-toggle");
        var panel = $(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
            panel.hidden = expanded;
        });
    }

    function initHero() {
        var slides = $all("[data-hero-slide]");
        var dots = $all("[data-hero-dot]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function activate(next) {
            slides[index].classList.remove("is-active");
            if (dots[index]) {
                dots[index].classList.remove("is-active");
            }
            index = next;
            slides[index].classList.add("is-active");
            if (dots[index]) {
                dots[index].classList.add("is-active");
            }
        }
        function start() {
            timer = window.setInterval(function () {
                activate((index + 1) % slides.length);
            }, 5000);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                activate(dotIndex);
                start();
            });
        });
        start();
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<span class=\"card-media\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"card-shade\"></span>" +
            "<span class=\"play-circle\">▶</span>" +
            "<span class=\"duration-badge\">" + escapeHtml(movie.duration) + "</span>" +
            "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>" +
            "</span>" +
            "<span class=\"card-body\">" +
            "<strong>" + escapeHtml(movie.title) + "</strong>" +
            "<span class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</span>" +
            "<span class=\"card-tags\">" + tags + "</span>" +
            "<span class=\"card-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + "</span>" +
            "</span>" +
            "</a>";
    }

    function initSearchPage() {
        var data = window.MOVIE_SEARCH_INDEX;
        var form = $("#searchForm");
        var input = $("#searchInput");
        var category = $("#categoryFilter");
        var type = $("#typeFilter");
        var results = $("#searchResults");
        var status = $("#searchStatus");
        if (!data || !form || !input || !results || !status) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render() {
            var query = input.value.trim().toLowerCase();
            var cat = category ? category.value : "";
            var kind = type ? type.value : "";
            var filtered = data.filter(function (movie) {
                var haystack = [movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase();
                return (!query || haystack.indexOf(query) !== -1) && (!cat || movie.category === cat) && (!kind || movie.type === kind);
            });
            status.textContent = filtered.length ? "找到 " + filtered.length + " 条相关影片" : "没有找到匹配影片";
            results.innerHTML = filtered.slice(0, 240).map(movieCard).join("");
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render();
        });
        [input, category, type].forEach(function (el) {
            if (el) {
                el.addEventListener("input", render);
                el.addEventListener("change", render);
            }
        });
        render();
    }

    window.initMoviePlayer = function (source) {
        var video = $(".movie-video");
        var cover = $(".player-cover");
        if (!video || !cover || !source) {
            return;
        }
        var loaded = false;
        var instance = null;
        function attach() {
            if (loaded) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                instance.loadSource(source);
                instance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }
            loaded = true;
        }
        function play() {
            attach();
            cover.classList.add("is-hidden");
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    cover.classList.remove("is-hidden");
                });
            }
        }
        cover.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (instance && typeof instance.destroy === "function") {
                instance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHero();
        initSearchPage();
    });
})();
