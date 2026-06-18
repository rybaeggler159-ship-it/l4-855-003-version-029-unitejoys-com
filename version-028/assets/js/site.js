(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-nav-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll(".rail-inner").forEach(function (section) {
      var row = section.querySelector("[data-scroll-row]");
      var left = section.querySelector("[data-scroll-left]");
      var right = section.querySelector("[data-scroll-right]");

      if (!row) {
        return;
      }

      if (left) {
        left.addEventListener("click", function () {
          row.scrollBy({ left: -340, behavior: "smooth" });
        });
      }

      if (right) {
        right.addEventListener("click", function () {
          row.scrollBy({ left: 340, behavior: "smooth" });
        });
      }
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panelNode) {
      var input = panelNode.querySelector("[data-filter-input]");
      var year = panelNode.querySelector("[data-filter-year]");
      var section = panelNode.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".filter-card"));
      var empty = section.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (input && query) {
        input.value = query;
      }

      function apply() {
        var text = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var matchedText = !text || haystack.indexOf(text) !== -1;
          var matchedYear = !selectedYear || cardYear === selectedYear;
          var matched = matchedText && matchedYear;

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (year) {
        year.addEventListener("change", apply);
      }

      apply();
    });
  });
})();
