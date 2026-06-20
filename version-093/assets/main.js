const mobileButton = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", () => {
        mobileNav.classList.toggle("open");
    });
}

const slides = Array.from(document.querySelectorAll(".hero-slide"));
const dots = Array.from(document.querySelectorAll(".hero-dot"));
const previousButton = document.querySelector("[data-hero-prev]");
const nextButton = document.querySelector("[data-hero-next]");
let currentSlide = 0;
let heroTimer = null;

function setHeroSlide(index) {
    if (!slides.length) {
        return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === currentSlide);
    });
    dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === currentSlide);
    });
}

function startHero() {
    if (!slides.length) {
        return;
    }
    clearInterval(heroTimer);
    heroTimer = setInterval(() => setHeroSlide(currentSlide + 1), 5200);
}

if (slides.length) {
    setHeroSlide(0);
    startHero();
    if (previousButton) {
        previousButton.addEventListener("click", () => {
            setHeroSlide(currentSlide - 1);
            startHero();
        });
    }
    if (nextButton) {
        nextButton.addEventListener("click", () => {
            setHeroSlide(currentSlide + 1);
            startHero();
        });
    }
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            setHeroSlide(index);
            startHero();
        });
    });
}

const filterBar = document.querySelector("[data-filter-bar]");

if (filterBar) {
    const searchInput = filterBar.querySelector("[data-filter-search]");
    const genreSelect = filterBar.querySelector("[data-filter-genre]");
    const yearSelect = filterBar.querySelector("[data-filter-year]");
    const regionSelect = filterBar.querySelector("[data-filter-region]");
    const resetButton = filterBar.querySelector("[data-filter-reset]");
    const cards = Array.from(document.querySelectorAll(".movie-card, .compact-card"));
    const emptyResult = document.querySelector("[data-empty-result]");
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (query && searchInput) {
        searchInput.value = query;
    }

    function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
    }

    function applyFilter() {
        const searchText = valueOf(searchInput);
        const genre = valueOf(genreSelect);
        const year = valueOf(yearSelect);
        const region = valueOf(regionSelect);
        let visibleCount = 0;

        cards.forEach((card) => {
            const haystack = [
                card.dataset.title || "",
                card.dataset.genre || "",
                card.dataset.region || "",
                card.dataset.year || "",
                card.dataset.type || ""
            ].join(" ").toLowerCase();
            const matchedSearch = !searchText || haystack.includes(searchText);
            const matchedGenre = !genre || (card.dataset.genre || "").toLowerCase().includes(genre);
            const matchedYear = !year || (card.dataset.year || "").toLowerCase() === year;
            const matchedRegion = !region || (card.dataset.region || "").toLowerCase().includes(region);
            const matched = matchedSearch && matchedGenre && matchedYear && matchedRegion;
            card.style.display = matched ? "" : "none";
            if (matched) {
                visibleCount += 1;
            }
        });

        if (emptyResult) {
            emptyResult.classList.toggle("show", visibleCount === 0);
        }
    }

    [searchInput, genreSelect, yearSelect, regionSelect].forEach((element) => {
        if (element) {
            element.addEventListener("input", applyFilter);
            element.addEventListener("change", applyFilter);
        }
    });

    if (resetButton) {
        resetButton.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (genreSelect) genreSelect.value = "";
            if (yearSelect) yearSelect.value = "";
            if (regionSelect) regionSelect.value = "";
            applyFilter();
        });
    }

    applyFilter();
}
