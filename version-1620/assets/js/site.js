(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(nextIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function getYearRange(value) {
    if (!value) {
      return null;
    }

    var parts = value.split('-').map(function (part) {
      return Number(part);
    });

    if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
      return null;
    }

    return {
      min: parts[0],
      max: parts[1]
    };
  }

  function initFilters() {
    var scopes = selectAll('[data-filter-scope]');

    scopes.forEach(function (scope) {
      var container = scope.parentElement || document;
      var list = container.querySelector('[data-card-list]') || document;
      var searchInput = scope.querySelector('[data-card-search]');
      var yearSelect = scope.querySelector('[data-year-filter]');
      var typeSelect = scope.querySelector('[data-type-filter]');
      var status = scope.querySelector('[data-filter-status]');
      var cards = selectAll('.movie-card', list);

      function apply() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var yearRange = getYearRange(yearSelect ? yearSelect.value : '');
        var typeValue = typeSelect ? typeSelect.value : '';
        var matched = 0;

        cards.forEach(function (card) {
          var searchText = (card.getAttribute('data-search') || '').toLowerCase();
          var year = Number(card.getAttribute('data-year')) || 0;
          var type = card.getAttribute('data-type') || '';
          var ok = true;

          if (keyword && searchText.indexOf(keyword) === -1) {
            ok = false;
          }

          if (yearRange && (year < yearRange.min || year > yearRange.max)) {
            ok = false;
          }

          if (typeValue && type !== typeValue) {
            ok = false;
          }

          card.hidden = !ok;
          card.classList.toggle('is-hidden', !ok);

          if (ok) {
            matched += 1;
          }
        });

        if (status) {
          status.textContent = '当前显示 ' + matched + ' 部';
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', apply);
      }

      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }

      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && searchInput) {
        searchInput.value = query;
      }

      apply();
    });
  }

  function attachNativeVideo(video, source, status, shell) {
    video.src = source;
    video.load();
    var promise = video.play();

    if (promise && promise.catch) {
      promise.catch(function () {
        if (status) {
          status.textContent = '已加载播放源，可使用视频控件继续播放';
        }
      });
    }

    shell.classList.add('is-playing');
  }

  function initPlayers() {
    var buttons = selectAll('[data-play-button]');

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var shell = button.closest('[data-player-shell]');
        var video = shell ? shell.querySelector('video') : null;
        var status = shell ? shell.querySelector('[data-player-status]') : null;
        var source = button.getAttribute('data-source');

        if (!shell || !video || !source) {
          return;
        }

        button.disabled = true;

        if (status) {
          status.textContent = '正在加载播放源';
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            shell.classList.add('is-playing');
            var promise = video.play();

            if (promise && promise.catch) {
              promise.catch(function () {
                if (status) {
                  status.textContent = '已加载播放源，可使用视频控件继续播放';
                }
              });
            }
          });
          hls.on(window.Hls.Events.ERROR, function () {
            if (status) {
              status.textContent = '播放源加载异常，正在尝试浏览器原生播放';
            }
            attachNativeVideo(video, source, status, shell);
          });
        } else {
          attachNativeVideo(video, source, status, shell);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHeroSlider();
    initFilters();
    initPlayers();
  });
})();
