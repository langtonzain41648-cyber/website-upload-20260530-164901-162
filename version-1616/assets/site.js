(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  const filterForms = Array.from(document.querySelectorAll("[data-filter-form]"));

  filterForms.forEach(function (form) {
    const scopeSelector = form.getAttribute("data-filter-scope");
    const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    const cards = scope ? Array.from(scope.querySelectorAll(".movie-card")) : [];
    const keywordInput = form.querySelector("[data-filter-keyword]");
    const yearSelect = form.querySelector("[data-filter-year]");
    const genreSelect = form.querySelector("[data-filter-genre]");
    const noResults = document.querySelector("[data-no-results]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      const keyword = normalize(keywordInput ? keywordInput.value : "");
      const year = normalize(yearSelect ? yearSelect.value : "");
      const genre = normalize(genreSelect ? genreSelect.value : "");
      let visibleCount = 0;

      cards.forEach(function (card) {
        const text = normalize(
          card.getAttribute("data-title") + " " +
          card.getAttribute("data-region") + " " +
          card.getAttribute("data-genre")
        );
        const cardYear = normalize(card.getAttribute("data-year"));
        const cardGenre = normalize(card.getAttribute("data-genre"));

        const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchYear = !year || cardYear === year;
        const matchGenre = !genre || cardGenre.indexOf(genre) !== -1;
        const isVisible = matchKeyword && matchYear && matchGenre;

        card.style.display = isVisible ? "" : "none";
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });

    [keywordInput, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });
})();
