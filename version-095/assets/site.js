document.addEventListener('DOMContentLoaded', function () {
    var navButton = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function playSlides() {
        if (timer) {
            window.clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            playSlides();
        });
    });

    document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
        button.addEventListener('click', function () {
            showSlide(current - 1);
            playSlides();
        });
    });

    document.querySelectorAll('[data-hero-next]').forEach(function (button) {
        button.addEventListener('click', function () {
            showSlide(current + 1);
            playSlides();
        });
    });

    showSlide(0);
    playSlides();

    var searchInput = document.querySelector('[data-search-input]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var keywords = normalize(card.getAttribute('data-keywords'));
            var tags = normalize(card.getAttribute('data-tags'));
            var matchesQuery = !query || keywords.indexOf(query) !== -1;
            var matchesFilter = activeFilter === 'all' || tags.indexOf(activeFilter) !== -1 || keywords.indexOf(activeFilter) !== -1;
            var shouldShow = matchesQuery && matchesFilter;

            card.classList.toggle('is-hidden', !shouldShow);

            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('visible', visible === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = normalize(button.getAttribute('data-filter-value')) || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilters();
        });
    });

    applyFilters();
});
