(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function() {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function move(step) {
        show(current + step);
      }

      function start() {
        stop();
        timer = window.setInterval(function() {
          move(1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function() {
          move(-1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function() {
          move(1);
          start();
        });
      }

      dots.forEach(function(dot, dotIndex) {
        dot.addEventListener("click", function() {
          show(dotIndex);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var panel = document.querySelector("[data-search-panel]");
    var resultsBox = document.querySelector("[data-search-results]");
    var closeSearch = document.querySelector("[data-search-close]");
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var index = window.MOVIE_INDEX || [];

    function clean(value) {
      return String(value || "").trim().toLowerCase();
    }

    function renderSearch(query) {
      if (!panel || !resultsBox) {
        return;
      }
      var key = clean(query);
      if (!key) {
        panel.hidden = true;
        return;
      }
      var matches = index.filter(function(item) {
        return [item.title, item.region, item.type, item.year, item.genre, item.category].join(" ").toLowerCase().indexOf(key) !== -1;
      }).slice(0, 18);

      if (!matches.length) {
        resultsBox.innerHTML = '<p class="empty-search">没有匹配到相关影片。</p>';
      } else {
        resultsBox.innerHTML = matches.map(function(item) {
          return '<a class="search-item" href="' + item.url + '">' +
            '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong><span>' +
            escapeHtml(item.year + " · " + item.region + " · " + item.type) +
            '</span></span></a>';
        }).join("");
      }
      panel.hidden = false;
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    forms.forEach(function(form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var input = form.querySelector("[data-search-input]");
        renderSearch(input ? input.value : "");
      });
    });

    inputs.forEach(function(input) {
      input.addEventListener("input", function() {
        renderSearch(input.value);
      });
    });

    if (closeSearch && panel) {
      closeSearch.addEventListener("click", function() {
        panel.hidden = true;
      });
    }

    document.addEventListener("click", function(event) {
      if (!panel || panel.hidden) {
        return;
      }
      var insidePanel = panel.contains(event.target);
      var insideForm = forms.some(function(form) {
        return form.contains(event.target);
      });
      if (!insidePanel && !insideForm) {
        panel.hidden = true;
      }
    });

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var noResults = document.querySelector("[data-no-results]");

    filterButtons.forEach(function(button) {
      button.addEventListener("click", function() {
        var filter = button.getAttribute("data-filter") || "all";
        filterButtons.forEach(function(btn) {
          btn.classList.toggle("is-active", btn === button);
        });

        var visible = 0;
        cards.forEach(function(card) {
          var haystack = [
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-title")
          ].join(" ");
          var matched = filter === "all" || haystack.indexOf(filter) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (noResults) {
          noResults.classList.toggle("is-visible", visible === 0);
        }
      });
    });
  });
})();
