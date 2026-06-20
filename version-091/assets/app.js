(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      }, { once: true });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function applyQueryInput(input) {
    var params = new URLSearchParams(window.location.search);
    var value = params.get("q") || "";
    if (value) {
      input.value = value;
    }
  }

  function setupCatalog() {
    var search = document.querySelector(".catalog-search");
    var grid = document.querySelector(".catalog-grid") || document.querySelector(".ranking-table");
    var sort = document.querySelector(".catalog-sort");
    var empty = document.querySelector(".no-results");
    if (!grid) {
      return;
    }
    var items = Array.prototype.slice.call(grid.children);

    if (search) {
      applyQueryInput(search);
    }

    function getText(item) {
      return item.getAttribute("data-search") || item.textContent || "";
    }

    function filter() {
      var phrase = search ? search.value.trim().toLowerCase() : "";
      var visible = 0;
      items.forEach(function (item) {
        var matched = !phrase || getText(item).toLowerCase().indexOf(phrase) !== -1;
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    function sortItems() {
      if (!sort) {
        return;
      }
      var mode = sort.value;
      var sorted = items.slice().sort(function (a, b) {
        if (mode === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }
        if (mode === "year") {
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        }
        return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
      });
      sorted.forEach(function (item) {
        grid.appendChild(item);
      });
      items = sorted;
      filter();
    }

    if (search) {
      search.addEventListener("input", filter);
    }
    if (sort) {
      sort.addEventListener("change", sortItems);
      sortItems();
    } else {
      filter();
    }
  }

  onReady(function () {
    setupMenu();
    setupImages();
    setupHero();
    setupCatalog();
  });
})();
