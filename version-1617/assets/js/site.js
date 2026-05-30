(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-main-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var regionFilter = document.querySelector("[data-region-filter]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var region = regionFilter ? regionFilter.value : "";
    var year = yearFilter ? yearFilter.value : "";

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-text") || "").toLowerCase();
      var title = (card.getAttribute("data-title") || "").toLowerCase();
      var cardRegion = card.getAttribute("data-region") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
      var regionMatch = !region || cardRegion === region;
      var yearMatch = !year || cardYear === year;
      card.classList.toggle("hidden-card", !(keywordMatch && regionMatch && yearMatch));
    });
  }

  [filterInput, regionFilter, yearFilter].forEach(function (element) {
    if (element) {
      element.addEventListener("input", applyFilters);
      element.addEventListener("change", applyFilters);
    }
  });

  var searchResults = document.querySelector("[data-search-results]");
  if (searchResults && typeof SEARCH_ITEMS !== "undefined") {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var queryLabel = document.querySelector("[data-search-query]");
    var resultsTitle = document.querySelector("[data-search-title]");

    if (queryLabel) {
      queryLabel.textContent = query || "全部影视";
    }

    var normalizedQuery = query.toLowerCase();
    var results = SEARCH_ITEMS.filter(function (item) {
      if (!normalizedQuery) {
        return true;
      }
      return item.text.toLowerCase().indexOf(normalizedQuery) !== -1;
    });

    if (resultsTitle) {
      resultsTitle.textContent = query ? "搜索结果" : "片库索引";
    }

    if (!results.length) {
      searchResults.innerHTML = '<div class="empty-state"><h2>未找到相关内容</h2><p>可以尝试更换片名、地区、年份或类型关键词。</p></div>';
      return;
    }

    searchResults.innerHTML = results.map(function (item) {
      return [
        '<article class="movie-card" data-card>',
        '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="poster-glow"></span>',
        '<span class="poster-badge">' + escapeHtml(item.region) + '</span>',
        '</a>',
        '<div class="card-body">',
        '<div class="card-meta"><span>' + item.year + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p>' + escapeHtml(item.oneLine) + '</p>',
        '<div class="card-tags">' + item.tags.slice(0, 4).map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join("") + '</div>',
        '</div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }
})();
