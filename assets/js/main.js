(function() {
  "use strict";

  function rootPrefix() {
    return document.body.getAttribute("data-root-prefix") || "";
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function() {
      panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function(form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();

        var input = form.querySelector("input[name='q']");
        var keyword = input ? input.value.trim() : "";

        if (keyword.length > 0) {
          window.location.href = rootPrefix() + "search.html?q=" + encodeURIComponent(keyword);
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    if (slides.length < 2) {
      return;
    }

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        render(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        render(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        render(index + 1);
        start();
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        render(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    render(0);
    start();
  }

  function setupCardFilter() {
    var filterInput = byId("movieFilter");
    var categorySelect = byId("filterCategory");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = byId("emptyState");

    if (!filterInput || cards.length === 0) {
      return;
    }

    function applyFilter() {
      var keyword = normalize(filterInput.value);
      var category = categorySelect ? categorySelect.value : "";
      var visibleCount = 0;

      cards.forEach(function(card) {
        var haystack = normalize(card.getAttribute("data-search-text"));
        var cardCategory = card.getAttribute("data-category") || "";
        var matchedKeyword = keyword.length === 0 || haystack.indexOf(keyword) !== -1;
        var matchedCategory = category.length === 0 || cardCategory === category;
        var visible = matchedKeyword && matchedCategory;

        card.style.display = visible ? "" : "none";

        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener("input", applyFilter);

    if (categorySelect) {
      categorySelect.addEventListener("change", applyFilter);
    }

    applyFilter();
  }

  function setupImageErrors() {
    var images = document.querySelectorAll("img[data-cover]");
    images.forEach(function(image) {
      image.addEventListener("error", function() {
        image.classList.add("is-missing");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupCardFilter();
    setupImageErrors();
  });
})();
