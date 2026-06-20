(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    start();
  }

  function setupSearch() {
    var layer = document.querySelector('.search-layer');
    var input = document.querySelector('.search-input');
    var results = document.querySelector('.search-results');
    var close = document.querySelector('.search-close');
    var triggers = Array.prototype.slice.call(document.querySelectorAll('.search-trigger'));
    var items = window.SITE_SEARCH || [];
    if (!layer || !input || !results) {
      return;
    }

    function render(list) {
      if (!list.length) {
        results.innerHTML = '<p class="empty-state">没有找到匹配的影片</p>';
        return;
      }
      results.innerHTML = list.slice(0, 36).map(function (item) {
        return '<a class="search-result-item" href="' + item.url + '">' +
          '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
          '<div><h3>' + escapeHtml(item.title) + '</h3>' +
          '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</p>' +
          '<p>' + escapeHtml(item.text || '') + '</p></div></a>';
      }).join('');
    }

    function query(value) {
      var q = value.trim().toLowerCase();
      if (!q) {
        render(items.slice(0, 12));
        return;
      }
      var list = items.filter(function (item) {
        var haystack = [item.title, item.region, item.year, item.type, item.genre, (item.tags || []).join(' '), item.text].join(' ').toLowerCase();
        return haystack.indexOf(q) !== -1;
      });
      render(list);
    }

    function open() {
      layer.classList.add('is-open');
      layer.setAttribute('aria-hidden', 'false');
      input.value = '';
      render(items.slice(0, 12));
      window.setTimeout(function () {
        input.focus();
      }, 30);
    }

    function hide() {
      layer.classList.remove('is-open');
      layer.setAttribute('aria-hidden', 'true');
    }

    triggers.forEach(function (button) {
      button.addEventListener('click', open);
    });
    if (close) {
      close.addEventListener('click', hide);
    }
    layer.addEventListener('click', function (event) {
      if (event.target === layer) {
        hide();
      }
    });
    input.addEventListener('input', function () {
      query(input.value);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        hide();
      }
    });
  }

  function setupLocalFilters() {
    var grid = document.querySelector('[data-local-grid]');
    if (!grid) {
      return;
    }
    var search = document.querySelector('[data-local-search]');
    var region = document.querySelector('[data-local-region]');
    var year = document.querySelector('[data-local-year]');
    var empty = document.querySelector('[data-local-empty]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
        var ok = (!q || haystack.indexOf(q) !== -1) && (!r || card.dataset.region === r) && (!y || card.dataset.year === y);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, region, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  window.setupPlayer = function (source) {
    ready(function () {
      var video = document.querySelector('[data-player-video]');
      var cover = document.querySelector('[data-player-cover]');
      var start = document.querySelector('[data-player-start]');
      var error = document.querySelector('[data-player-error]');
      var hls = null;
      var loaded = false;
      if (!video) {
        return;
      }

      function showError() {
        if (error) {
          error.hidden = false;
        }
        if (cover) {
          cover.classList.add('is-hidden');
        }
      }

      function load() {
        if (loaded) {
          video.play().catch(function () {});
          return;
        }
        loaded = true;
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (error) {
          error.hidden = true;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showError();
              if (hls) {
                hls.destroy();
                hls = null;
              }
            }
          });
          return;
        }
        showError();
      }

      if (cover) {
        cover.addEventListener('click', load);
      }
      if (start) {
        start.addEventListener('click', load);
      }
      video.addEventListener('click', function () {
        if (!loaded) {
          load();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearch();
    setupLocalFilters();
  });
})();
