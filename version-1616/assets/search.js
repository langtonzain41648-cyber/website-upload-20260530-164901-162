(function () {
  const form = document.querySelector("[data-global-search]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const message = document.querySelector("[data-search-message]");

  if (!form || !input || !results || !window.SEARCH_MOVIES) {
    return;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function render(items, query) {
    results.innerHTML = items.map(function (item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-wrap" href="' + escapeHtml(item.url) + '">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="poster-play">▶</span>',
        '    <span class="poster-year">' + escapeHtml(item.year) + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <a href="' + escapeHtml(item.url) + '" class="movie-title">' + escapeHtml(item.title) + '</a>',
        '    <p class="movie-line">' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="movie-meta">',
        '      <span>' + escapeHtml(item.region) + '</span>',
        '      <span>' + escapeHtml(item.genre.split("/")[0] || item.type) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");

    if (message) {
      if (query) {
        message.textContent = "找到 " + items.length + " 条与“" + query + "”相关的影片。";
      } else {
        message.textContent = "输入关键词可检索全站影片，默认展示热度较高的内容。";
      }
    }
  }

  function search() {
    const query = input.value.trim();
    const normalized = normalize(query);

    let items = window.SEARCH_MOVIES;

    if (normalized) {
      items = items.filter(function (item) {
        const haystack = normalize(
          item.title + " " +
          item.year + " " +
          item.region + " " +
          item.type + " " +
          item.genre + " " +
          item.category + " " +
          item.oneLine
        );

        return haystack.indexOf(normalized) !== -1;
      });
    }

    items = items
      .slice()
      .sort(function (a, b) {
        return b.views - a.views;
      })
      .slice(0, 120);

    render(items, query);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    search();
  });

  input.addEventListener("input", search);

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  input.value = initialQuery;
  search();
})();
