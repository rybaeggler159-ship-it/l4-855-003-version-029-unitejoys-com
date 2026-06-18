(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var menuToggle = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", function() {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    if (slides.length) {
      if (prev) {
        prev.addEventListener("click", function() {
          showSlide(index - 1);
        });
      }

      if (next) {
        next.addEventListener("click", function() {
          showSlide(index + 1);
        });
      }

      dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
          showSlide(Number(dot.getAttribute("data-slide")) || 0);
        });
      });

      window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    var filterInput = document.querySelector(".filter-input");

    if (query && filterInput) {
      filterInput.value = query;
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
      var input = scope.querySelector(".filter-input");
      var yearSelect = scope.querySelector(".year-filter");
      var typeSelect = scope.querySelector(".type-filter");
      var grid = scope.nextElementSibling ? scope.nextElementSibling.querySelector(".movie-grid") : null;
      var empty = scope.nextElementSibling ? scope.nextElementSibling.querySelector(".empty-state") : null;
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-card]")) : [];

      function applyFilters() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;

        cards.forEach(function(card) {
          var text = card.getAttribute("data-text") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          if (type && cardType !== type) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible === 0 ? "block" : "none";
        }
      }

      if (input) {
        input.addEventListener("input", applyFilters);
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilters);
      }

      if (typeSelect) {
        typeSelect.addEventListener("change", applyFilters);
      }

      applyFilters();
    });
  });
})();
