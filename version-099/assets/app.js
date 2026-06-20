(function () {
    var ready = function (callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    };

    var toArray = function (list) {
        return Array.prototype.slice.call(list || []);
    };

    ready(function () {
        var menuButton = document.querySelector("[data-mobile-menu-button]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");

        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        toArray(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    event.preventDefault();
                }
            });
        });

        setupHero();
        setupFilters();
        setupPlayer();
    });

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }

        var slides = toArray(root.querySelectorAll("[data-hero-slide]"));
        var dots = toArray(root.querySelectorAll("[data-hero-dot]"));
        var previous = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        var start = function () {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6200);
        };

        var stop = function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        toArray(document.querySelectorAll("[data-filter-root]")).forEach(function (root) {
            var input = root.querySelector("[data-filter-input]");
            var chips = toArray(root.querySelectorAll("[data-filter-chip]"));
            var cards = toArray(root.querySelectorAll("[data-filter-card]"));
            var empty = root.querySelector("[data-filter-empty]");
            var activeChip = "";
            var url = new URL(window.location.href);
            var query = url.searchParams.get("q") || "";

            if (input && query) {
                input.value = query;
            }

            var apply = function () {
                var value = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var category = card.getAttribute("data-category") || "";
                    var type = card.getAttribute("data-type") || "";
                    var matchedText = !value || text.indexOf(value) !== -1;
                    var matchedChip = !activeChip || category === activeChip || type.indexOf(activeChip) !== -1 || text.indexOf(activeChip) !== -1;
                    var showCard = matchedText && matchedChip;
                    card.classList.toggle("hidden-card", !showCard);
                    if (showCard) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            };

            if (input) {
                input.addEventListener("input", apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeChip = chip.getAttribute("data-filter-chip") || "";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    function setupPlayer() {
        var wrap = document.querySelector("[data-stream]");
        if (!wrap) {
            return;
        }

        var video = wrap.querySelector("video");
        var layer = wrap.querySelector("[data-play-layer]");
        var message = wrap.querySelector("[data-player-message]");
        var stream = wrap.getAttribute("data-stream");
        var hls = null;
        var loaded = false;

        if (!video || !stream) {
            return;
        }

        var showMessage = function (text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add("is-visible");
            window.setTimeout(function () {
                message.classList.remove("is-visible");
            }, 2600);
        };

        var attach = function () {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        return;
                    }
                    showMessage("视频加载失败");
                });
                return;
            }

            video.src = stream;
        };

        var play = function () {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (layer) {
                        layer.classList.remove("is-hidden");
                    }
                    showMessage("点击视频继续播放");
                });
            }
        };

        if (layer) {
            layer.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && layer) {
                layer.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }
})();
