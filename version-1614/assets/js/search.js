(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }

    document.addEventListener("DOMContentLoaded", callback);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCard(movie) {
    return [
      '<a class="movie-card" href="detail/' + encodeURIComponent(movie.id) + '.html" data-movie-card data-title="' + escapeHtml(movie.title.toLowerCase()) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-genre="' + escapeHtml(movie.genre) + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
      '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '  </span>',
      '  <span class="card-info">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <small>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</small>',
      '    <em>' + escapeHtml(movie.oneLine) + '</em>',
      '  </span>',
      '</a>'
    ].join("");
  }

  ready(function () {
    var formInput = document.querySelector("[data-search-input]");
    var resultBox = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var allMovies = window.MOVIE_SEARCH_INDEX || [];

    if (formInput) {
      formInput.value = query;
    }

    if (!resultBox || !summary) {
      return;
    }

    if (!query) {
      summary.textContent = "请输入关键词搜索片名、类型、地区、年份或标签。";
      resultBox.innerHTML = '<div class="search-empty">可以搜索影片标题、年份、地区、类型或标签。</div>';
      return;
    }

    var normalized = query.toLowerCase();
    var words = normalized.split(/\s+/).filter(Boolean);

    var results = allMovies.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        (movie.tags || []).join(" "),
        movie.oneLine
      ].join(" ").toLowerCase();

      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    });

    summary.textContent = "关键词 “" + query + "” 共找到 " + results.length + " 部影片。";

    if (!results.length) {
      resultBox.innerHTML = '<div class="search-empty">未找到相关影片，请更换关键词再试。</div>';
      return;
    }

    resultBox.innerHTML = results.map(renderCard).join("");
  });
})();
