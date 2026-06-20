(function () {
    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot') || '0'));
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    function filterCards(input) {
        var scope = input.closest('main') || document;
        var cards = scope.querySelectorAll('[data-filter-scope] .movie-card, [data-filter-scope] .ranking-row');
        var value = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-year') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
            card.classList.toggle('is-hidden-by-filter', value && haystack.indexOf(value) === -1);
        });
    }

    document.querySelectorAll('[data-card-filter]').forEach(function (input) {
        input.addEventListener('input', function () {
            filterCards(input);
        });
    });

    function movieCardTemplate(movie) {
        return [
            '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '" data-year="' + escapeHtml(movie.year) + '">',
            '    <a href="' + escapeHtml(movie.file) + '" class="poster-wrap" aria-label="' + escapeHtml(movie.title) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-shade"></span>',
            '        <span class="poster-play" aria-hidden="true"></span>',
            '        <span class="poster-meta">' + escapeHtml(movie.year) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <a class="movie-title" href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a>',
            '        <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="movie-tags"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    var globalSearch = document.querySelector('[data-global-search]');
    var globalResults = document.querySelector('[data-search-results]');

    if (globalSearch && globalResults && window.MOVIE_SEARCH_INDEX) {
        globalSearch.addEventListener('input', function () {
            var keyword = globalSearch.value.trim().toLowerCase();
            if (!keyword) {
                globalResults.innerHTML = '<p class="empty-state">请输入关键词开始搜索。</p>';
                return;
            }

            var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                return movie.searchText.indexOf(keyword) !== -1;
            }).slice(0, 120);

            if (!matched.length) {
                globalResults.innerHTML = '<p class="empty-state">没有找到匹配影片。</p>';
                return;
            }

            globalResults.innerHTML = matched.map(movieCardTemplate).join('');
        });
    }

    var hlsScriptLoading = false;
    var hlsCallbacks = [];

    function ensureHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        hlsCallbacks.push(callback);

        if (hlsScriptLoading) {
            return;
        }

        hlsScriptLoading = true;
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.onload = function () {
            var callbacks = hlsCallbacks.slice();
            hlsCallbacks.length = 0;
            callbacks.forEach(function (item) {
                item();
            });
        };
        script.onerror = function () {
            var callbacks = hlsCallbacks.slice();
            hlsCallbacks.length = 0;
            callbacks.forEach(function (item) {
                item();
            });
        };
        document.head.appendChild(script);
    }

    function playVideo(player) {
        var video = player.querySelector('video');
        if (!video) {
            return;
        }

        var source = video.getAttribute('data-src');
        if (!source) {
            return;
        }

        player.classList.add('is-playing');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== source) {
                video.src = source;
            }
            video.play().catch(function () {});
            return;
        }

        ensureHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                if (video._hlsInstance) {
                    video._hlsInstance.destroy();
                }
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                video._hlsInstance = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = source;
                video.play().catch(function () {});
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-play-button]');

        if (overlay) {
            overlay.addEventListener('click', function () {
                playVideo(player);
            });
        }

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        }
    });

    document.querySelectorAll('[data-source-switch]').forEach(function (button) {
        button.addEventListener('click', function () {
            var player = document.querySelector('[data-player]');
            if (!player) {
                return;
            }
            var video = player.querySelector('video');
            if (!video) {
                return;
            }
            var source = button.getAttribute('data-src');
            video.setAttribute('data-src', source);
            if (video._hlsInstance) {
                video._hlsInstance.destroy();
                video._hlsInstance = null;
            }
            video.removeAttribute('src');
            video.load();
            playVideo(player);
        });
    });
})();
