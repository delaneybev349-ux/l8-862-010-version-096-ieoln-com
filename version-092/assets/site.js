(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var prev = hero.querySelector(".hero-control.prev");
        var next = hero.querySelector(".hero-control.next");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                play();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        if (slides.length > 1) {
            play();
        }
    }

    function fillOptions(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            if (!value) {
                return;
            }
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-movie-grid]");
        if (!panel || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var input = panel.querySelector("[data-local-search]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var regionSelect = panel.querySelector("[data-filter-region]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var years = Array.from(new Set(cards.map(function (card) { return card.dataset.year; }))).sort().reverse();
        var regions = Array.from(new Set(cards.map(function (card) { return card.dataset.region; }))).sort();
        var types = Array.from(new Set(cards.map(function (card) { return card.dataset.type; }))).sort();
        fillOptions(yearSelect, years);
        fillOptions(regionSelect, regions);
        fillOptions(typeSelect, types);

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var region = regionSelect ? regionSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            cards.forEach(function (card) {
                var ok = true;
                if (keyword && card.dataset.search.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (year && card.dataset.year !== year) {
                    ok = false;
                }
                if (region && card.dataset.region !== region) {
                    ok = false;
                }
                if (type && card.dataset.type !== type) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
            });
        }

        [input, yearSelect, regionSelect, typeSelect].forEach(function (el) {
            if (!el) {
                return;
            }
            el.addEventListener("input", apply);
            el.addEventListener("change", apply);
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && input) {
            input.value = q;
        }
        apply();
    }

    window.initMoviePlayer = function (stream) {
        var wrap = document.querySelector("[data-player]");
        if (!wrap) {
            return;
        }
        var video = wrap.querySelector("video");
        var cover = wrap.querySelector(".player-cover");
        var hls = null;
        var attached = false;

        function attach() {
            if (attached || !video) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var playTask = video.play();
            if (playTask && playTask.catch) {
                playTask.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        }
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
