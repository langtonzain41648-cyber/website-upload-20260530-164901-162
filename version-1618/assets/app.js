(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    const startTimer = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-index')) || 0);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  const searchInput = document.querySelector('.js-card-search');
  const typeFilter = document.querySelector('.js-type-filter');
  const yearFilter = document.querySelector('.js-year-filter');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  const normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };

  const applyFilters = function () {
    const keyword = normalize(searchInput ? searchInput.value : '');
    const type = normalize(typeFilter ? typeFilter.value : '');
    const year = normalize(yearFilter ? yearFilter.value : '');
    let shown = 0;

    cards.forEach(function (card) {
      const text = normalize(card.textContent + ' ' + card.dataset.title + ' ' + card.dataset.genre + ' ' + card.dataset.region + ' ' + card.dataset.type + ' ' + card.dataset.year);
      const typeOk = !type || normalize(card.dataset.type).indexOf(type) !== -1 || text.indexOf(type) !== -1;
      const yearOk = !year || normalize(card.dataset.year) === year;
      const keywordOk = !keyword || text.indexOf(keyword) !== -1;
      const visible = typeOk && yearOk && keywordOk;

      card.style.display = visible ? '' : 'none';

      if (visible) {
        shown += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', shown === 0);
    }
  };

  [searchInput, typeFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  if (cards.length) {
    applyFilters();
  }
})();
