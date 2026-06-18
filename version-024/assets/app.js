(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var prev = hero.querySelector(".hero-arrow.prev");
    var next = hero.querySelector(".hero-arrow.next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initScrollers() {
    document.querySelectorAll("[data-scroll-target]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.querySelector(button.getAttribute("data-scroll-target"));
        if (!target) {
          return;
        }
        var distance = button.getAttribute("data-direction") === "left" ? -340 : 340;
        target.scrollBy({ left: distance, behavior: "smooth" });
      });
    });
  }

  function initFilters() {
    document.querySelectorAll(".filter-panel").forEach(function (panel) {
      var input = panel.querySelector(".filter-input");
      var select = panel.querySelector(".filter-select");
      var gridSelector = panel.getAttribute("data-grid") || ".movie-grid";
      var grid = document.querySelector(gridSelector);
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function apply() {
        var query = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].map(normalize).join(" ");
          card.style.display = text.indexOf(query) >= 0 ? "" : "none";
        });

        if (select && select.value) {
          var sorted = cards.slice().sort(function (a, b) {
            if (select.value === "title") {
              return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
            }
            if (select.value === "year") {
              return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
            }
            return 0;
          });
          sorted.forEach(function (card) {
            grid.appendChild(card);
          });
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      apply();
    });
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || typeof SITE_SEARCH_INDEX === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    var input = page.querySelector("input[name='q']");
    var results = page.querySelector(".search-results");
    var empty = page.querySelector(".empty-state");
    if (input) {
      input.value = initial;
    }

    function card(movie) {
      var tags = movie.tags ? movie.tags.split(" ").slice(0, 3).map(function (tag) {
        return "<span>" + tag + "</span>";
      }).join("") : "";
      return "<a class=\"movie-card grid\" href=\"" + movie.url + "\" data-title=\"" + movie.title + "\" data-year=\"" + movie.year + "\" data-region=\"" + movie.region + "\" data-type=\"" + movie.type + "\" data-tags=\"" + (movie.tags || "") + "\">" +
        "<span class=\"poster-wrap\"><img src=\"" + movie.image + "\" alt=\"" + movie.title + "\" loading=\"lazy\"><span class=\"poster-shade\"></span><span class=\"card-type\">" + movie.type + "</span><span class=\"card-play\">▶</span></span>" +
        "<span class=\"movie-card-body\"><strong>" + movie.title + "</strong><span class=\"card-meta\">" + movie.region + " · " + movie.year + " · " + movie.genre + "</span><span class=\"card-line\">" + movie.line + "</span><span class=\"card-tags\">" + tags + "</span></span>" +
        "</a>";
    }

    function runSearch(query) {
      var keyword = normalize(query);
      var items = SITE_SEARCH_INDEX.filter(function (movie) {
        var body = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.line].join(" "));
        return !keyword || body.indexOf(keyword) >= 0;
      }).slice(0, 96);
      if (results) {
        results.innerHTML = items.map(card).join("");
      }
      if (empty) {
        empty.style.display = items.length ? "none" : "block";
      }
    }

    page.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input ? input.value : "";
      var url = new URL(window.location.href);
      if (value.trim()) {
        url.searchParams.set("q", value.trim());
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
      runSearch(value);
    });

    runSearch(initial);
  }

  ready(function () {
    initMenu();
    initHero();
    initScrollers();
    initFilters();
    initSearchPage();
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById("movie-player");
  var start = document.getElementById("player-start");
  var stage = document.getElementById("player-stage");
  if (!video || !start || !stage || !sourceUrl) {
    return;
  }

  var hlsInstance = null;
  var attached = false;

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      video.load();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = sourceUrl;
    video.load();
  }

  function playVideo() {
    attachSource();
    start.classList.add("is-hidden");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        start.classList.remove("is-hidden");
      });
    }
  }

  attachSource();
  start.addEventListener("click", playVideo);
  stage.addEventListener("click", function (event) {
    if (event.target === stage || event.target === video) {
      playVideo();
    }
  });
  video.addEventListener("play", function () {
    start.classList.add("is-hidden");
  });
  video.addEventListener("ended", function () {
    start.classList.remove("is-hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance && typeof hlsInstance.destroy === "function") {
      hlsInstance.destroy();
    }
  });
}
