(function () {
  var navToggle = document.getElementById("nav-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        showSlide(position);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var siteSearch = document.getElementById("site-search");
  var searchPanel = document.getElementById("search-panel");
  if (siteSearch && searchPanel && Array.isArray(window.SITE_MOVIES)) {
    siteSearch.addEventListener("input", function () {
      var query = siteSearch.value.trim().toLowerCase();
      if (!query) {
        searchPanel.classList.remove("open");
        searchPanel.innerHTML = "";
        return;
      }
      var results = window.SITE_MOVIES.filter(function (item) {
        return [item.title, item.year, item.region, item.genre].join(" ").toLowerCase().indexOf(query) !== -1;
      }).slice(0, 10);
      if (!results.length) {
        searchPanel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
      } else {
        searchPanel.innerHTML = results.map(function (item) {
          return '<a href="' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</small></a>';
        }).join("");
      }
      searchPanel.classList.add("open");
    });

    document.addEventListener("click", function (event) {
      if (!searchPanel.contains(event.target) && event.target !== siteSearch) {
        searchPanel.classList.remove("open");
      }
    });
  }

  document.querySelectorAll("[data-card-search]").forEach(function (input) {
    var target = document.querySelector(input.getAttribute("data-target"));
    if (!target) {
      return;
    }
    var cards = Array.prototype.slice.call(target.querySelectorAll("[data-title]"));
    var empty = document.querySelector('[data-empty-for="' + target.id + '"]');
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.genre].join(" ").toLowerCase();
        var match = haystack.indexOf(query) !== -1;
        card.style.display = match ? "" : "none";
        if (match) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    });
  });

  document.querySelectorAll("[data-sort-select]").forEach(function (select) {
    var target = document.querySelector(select.getAttribute("data-target"));
    if (!target) {
      return;
    }
    select.addEventListener("change", function () {
      var cards = Array.prototype.slice.call(target.children);
      var value = select.value;
      cards.sort(function (a, b) {
        if (value === "year-desc") {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (value === "year-asc") {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        }
        if (value === "title-asc") {
          return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
        }
        return Number(a.dataset.order || 0) - Number(b.dataset.order || 0);
      });
      cards.forEach(function (card) {
        target.appendChild(card);
      });
    });
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }
})();
