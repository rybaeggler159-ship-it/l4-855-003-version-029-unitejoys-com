(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form], [data-search-page-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "search.html?q=" + encodeURIComponent(query);
        } else {
          window.location.href = "search.html";
        }
      });
    });
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
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

  function setupCardFilters() {
    var list = document.querySelector("[data-card-list]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var search = document.querySelector("[data-card-search]");
    var empty = document.querySelector("[data-empty-state]");
    if (!list) {
      return;
    }
    var active = "all";

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var visible = 0;
      list.querySelectorAll("[data-card]").forEach(function (card) {
        var type = card.getAttribute("data-type") || "";
        var text = card.getAttribute("data-search") || "";
        var okType = active === "all" || type === active;
        var okSearch = query === "" || text.indexOf(query) !== -1;
        var show = okType && okSearch;
        card.classList.toggle("is-filter-hidden", !show);
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        active = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });

    if (search) {
      search.addEventListener("input", apply);
    }
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cardTemplate(movie) {
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHTML(movie.url) + "\" aria-label=\"观看" + escapeHTML(movie.title) + "\">",
      "<div class=\"poster-wrap\">",
      "<img src=\"" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\">",
      "<div class=\"poster-shade\"></div>",
      "<span class=\"badge type-badge\">" + escapeHTML(movie.type) + "</span>",
      "<span class=\"badge year-badge\">" + escapeHTML(movie.year) + "</span>",
      "</div>",
      "<div class=\"card-body\">",
      "<h2>" + escapeHTML(movie.title) + "</h2>",
      "<p>" + escapeHTML(movie.oneLine) + "</p>",
      "<div class=\"card-meta\"><span>" + escapeHTML(movie.region) + "</span><span>" + escapeHTML(movie.genre) + "</span></div>",
      "</div>",
      "</a>",
      "</article>"
    ].join("");
  }

  function setupSearchPage() {
    var results = document.getElementById("search-results");
    var title = document.getElementById("search-title");
    var counter = document.getElementById("result-counter");
    var empty = document.getElementById("search-empty");
    var form = document.querySelector("[data-search-page-form]");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = form ? form.querySelector("input[name='q']") : null;
    if (input) {
      input.value = query;
    }
    if (!query) {
      if (empty) {
        empty.classList.remove("is-visible");
      }
      return;
    }
    var lower = query.toLowerCase();
    var matched = window.SEARCH_INDEX.filter(function (movie) {
      return movie.search.indexOf(lower) !== -1;
    });
    results.innerHTML = matched.slice(0, 120).map(cardTemplate).join("");
    if (title) {
      title.textContent = "搜索结果：" + query;
    }
    if (counter) {
      counter.textContent = matched.length + " 个结果";
    }
    if (empty) {
      empty.classList.toggle("is-visible", matched.length === 0);
    }
  }

  ready(function () {
    setupSearchForms();
    setupMobileMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
  });
})();

function initPlayer(videoId, playId, overlayId, source) {
  var video = document.getElementById(videoId);
  var play = document.getElementById(playId);
  var overlay = document.getElementById(overlayId);
  var loaded = false;
  var hls = null;

  function load() {
    if (loaded || !video || !source) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    loaded = true;
  }

  function start() {
    load();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video) {
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }
  if (play) {
    play.addEventListener("click", start);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }
}
