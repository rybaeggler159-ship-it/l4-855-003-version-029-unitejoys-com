(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("img[data-cover]").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("cover-muted");
      });
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function show(index) {
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
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-key]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-region]"));
      var active = {};

      function applyFilters() {
        var queryInput = document.getElementById("searchInput");
        var query = normalize(queryInput ? queryInput.value : new URLSearchParams(location.search).get("q"));

        cards.forEach(function (card) {
          var visible = true;
          Object.keys(active).forEach(function (key) {
            var value = active[key];
            if (value && value !== "all" && card.getAttribute("data-" + key) !== value) {
              visible = false;
            }
          });
          if (query) {
            var haystack = normalize(card.getAttribute("data-search"));
            visible = visible && haystack.indexOf(query) !== -1;
          }
          card.classList.toggle("is-hidden", !visible);
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var key = button.getAttribute("data-filter-key");
          var value = button.getAttribute("data-filter-value");
          active[key] = value;
          buttons.filter(function (item) {
            return item.getAttribute("data-filter-key") === key;
          }).forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          applyFilters();
        });
      });

      var searchInput = document.getElementById("searchInput");
      if (searchInput) {
        var params = new URLSearchParams(location.search);
        var q = params.get("q") || "";
        searchInput.value = q;
        searchInput.addEventListener("input", applyFilters);
      }

      applyFilters();
    });
  });
})();
