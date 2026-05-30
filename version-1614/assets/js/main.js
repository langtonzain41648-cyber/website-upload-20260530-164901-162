(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }

    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    setupHero();
    setupPageFilter();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });

    if (index < 0) {
      index = 0;
    }

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

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5000);

    show(index);
  }

  function setupPageFilter() {
    var input = document.querySelector("[data-page-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var count = document.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    if (!cards.length || (!input && !yearSelect)) {
      return;
    }

    var years = cards
      .map(function (card) {
        return card.getAttribute("data-year") || "";
      })
      .filter(Boolean)
      .filter(function (value, position, array) {
        return array.indexOf(value) === position;
      })
      .sort(function (a, b) {
        return Number(b) - Number(a);
      });

    if (yearSelect) {
      years.forEach(function (year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();

        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute("data-year") === year;
        var shouldShow = matchedKeyword && matchedYear;

        card.classList.toggle("is-hidden", !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "显示 " + visible + " / " + cards.length + " 部";
      }
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", filterCards);
    }

    filterCards();
  }
})();
