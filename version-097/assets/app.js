(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-menu');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            menu.hidden = expanded;
            toggle.textContent = expanded ? '☰' : '×';
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                play();
            });
        });
        show(0);
        play();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var scopeSelector = panel.getAttribute('data-filter-panel');
            var scope = document.querySelector(scopeSelector) || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var queryInput = panel.querySelector('[data-filter-query]');
            var yearSelect = panel.querySelector('[data-filter-year]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var regionSelect = panel.querySelector('[data-filter-region]');
            var noResults = document.querySelector('[data-no-results]');

            function apply() {
                var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
                var year = yearSelect ? yearSelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                var region = regionSelect ? regionSelect.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (year && text.indexOf(year.toLowerCase()) === -1) {
                        matched = false;
                    }
                    if (type && text.indexOf(type.toLowerCase()) === -1) {
                        matched = false;
                    }
                    if (region && text.indexOf(region.toLowerCase()) === -1) {
                        matched = false;
                    }
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (noResults) {
                    noResults.classList.toggle('is-visible', visible === 0);
                }
            }

            [queryInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            });

            if (queryInput && document.body.getAttribute('data-page') === 'search') {
                var params = new URLSearchParams(window.location.search);
                var initial = params.get('q');
                if (initial) {
                    queryInput.value = initial;
                }
            }
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.player-box'));
        players.forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.player-overlay');
            if (!video || !button) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            var attached = false;

            function attach() {
                if (attached || !stream) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            box.classList.add('has-error');
                        }
                    });
                } else {
                    video.src = stream;
                }
            }

            function start() {
                attach();
                video.controls = true;
                box.classList.add('is-playing');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        box.classList.remove('is-playing');
                    });
                }
            }

            button.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
