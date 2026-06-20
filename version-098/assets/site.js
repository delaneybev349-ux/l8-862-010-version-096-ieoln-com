const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
        return;
    }
    callback();
};

const normalize = (value) => String(value || "").trim().toLowerCase();

function bootMenu() {
    const button = document.querySelector("[data-menu-button]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
        return;
    }
    button.addEventListener("click", () => {
        menu.classList.toggle("is-open");
    });
}

function bootHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    if (slides.length <= 1) {
        return;
    }
    let current = 0;
    let timer = null;
    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    };
    const start = () => {
        stop();
        timer = window.setInterval(() => show(current + 1), 5200);
    };
    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            show(index);
            start();
        });
    });
    if (prev) {
        prev.addEventListener("click", () => {
            show(current - 1);
            start();
        });
    }
    if (next) {
        next.addEventListener("click", () => {
            show(current + 1);
            start();
        });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
}

function bootFilters() {
    const panels = Array.from(document.querySelectorAll(".filter-panel"));
    panels.forEach((panel) => {
        const root = panel.parentElement || document;
        const input = panel.querySelector("[data-filter-input]");
        const typeSelect = panel.querySelector("[data-filter-type]");
        const yearSelect = panel.querySelector("[data-filter-year]");
        const cards = Array.from(root.querySelectorAll("[data-movie-card]"));
        const update = () => {
            const keyword = normalize(input ? input.value : "");
            const typeValue = normalize(typeSelect ? typeSelect.value : "");
            const yearValue = normalize(yearSelect ? yearSelect.value : "");
            cards.forEach((card) => {
                const haystack = normalize(card.dataset.tags + " " + card.dataset.title);
                const type = normalize(card.dataset.type);
                const year = normalize(card.dataset.year);
                const matchedKeyword = !keyword || haystack.includes(keyword);
                const matchedType = !typeValue || type.includes(typeValue);
                const matchedYear = !yearValue || year === yearValue;
                card.classList.toggle("is-hidden", !(matchedKeyword && matchedType && matchedYear));
            });
        };
        if (input) {
            input.addEventListener("input", update);
        }
        if (typeSelect) {
            typeSelect.addEventListener("change", update);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", update);
        }
    });
}

ready(() => {
    bootMenu();
    bootHero();
    bootFilters();
});
