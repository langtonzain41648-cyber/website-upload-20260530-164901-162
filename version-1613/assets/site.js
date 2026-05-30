function handleImageError(image) {
  image.style.display = 'none';
  var box = image.closest('.cover-box') || image.parentElement;
  if (box) {
    box.classList.add('image-failed');
  }
}

function setupMobileMenu() {
  var button = document.querySelector('[data-menu-button]');
  var nav = document.querySelector('[data-main-nav]');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
}

function setupHero() {
  var hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var prev = hero.querySelector('[data-hero-prev]');
  var next = hero.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(index + 1);
      restart();
    });
  }

  show(0);
  restart();
}

function setupLocalFilters() {
  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  scopes.forEach(function (scope) {
    var section = scope.closest('section') || document;
    var list = section.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var input = scope.querySelector('[data-filter-input]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    var reset = scope.querySelector('[data-filter-reset]');
    var empty = section.querySelector('[data-empty-result]');

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    var years = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-year') || '';
    }).filter(Boolean))).sort().reverse();

    var types = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-type') || '';
    }).filter(Boolean))).sort();

    fillSelect(yearSelect, years);
    fillSelect(typeSelect, types);

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        var matched = matchQuery && matchYear && matchType;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        apply();
      });
    }
  });
}

function setupPlayer() {
  var trigger = document.querySelector('[data-play-trigger]');
  var player = document.getElementById('moviePlayer');
  if (!trigger || !player) {
    return;
  }
  trigger.addEventListener('click', function () {
    var source = trigger.getAttribute('data-source');
    if (!source) {
      trigger.querySelector('strong').textContent = '暂无可用播放源';
      return;
    }
    trigger.classList.add('is-hidden');
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(player);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        player.play().catch(function () {});
      });
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = source;
      player.addEventListener('loadedmetadata', function () {
        player.play().catch(function () {});
      }, { once: true });
    } else {
      player.src = source;
      player.play().catch(function () {});
    }
  });
}

function movieCardTemplate(movie) {
  var tags = movie.tags.slice(0, 3).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');
  return '' +
    '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">' +
      '<a class="cover-box" href="detail/' + movie.id + '.html" aria-label="观看' + escapeHtml(movie.title) + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="handleImageError(this)">' +
        '<span class="cover-fallback">' + escapeHtml(movie.title.slice(0, 2)) + '</span>' +
        '<span class="play-chip">立即观看</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
        '<h2><a href="detail/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h2>' +
        '<p class="meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></p>' +
        '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
    '</article>';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character];
  });
}

function setupGlobalSearch() {
  var input = document.getElementById('globalSearchInput');
  var button = document.getElementById('globalSearchButton');
  var results = document.getElementById('searchResults');
  var summary = document.getElementById('searchSummary');
  if (!input || !results || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  function render() {
    var query = input.value.trim().toLowerCase();
    var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags.join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();
      return !query || haystack.indexOf(query) !== -1;
    }).slice(0, 300);

    results.innerHTML = matched.map(movieCardTemplate).join('');
    if (summary) {
      summary.textContent = query ? '找到 ' + matched.length + ' 条匹配结果，最多展示前 300 条。' : '默认展示按年份排序的 300 部影片。';
    }
  }

  input.addEventListener('input', render);
  if (button) {
    button.addEventListener('click', render);
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q) {
    input.value = q;
    render();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHero();
  setupLocalFilters();
  setupPlayer();
  setupGlobalSearch();
});
