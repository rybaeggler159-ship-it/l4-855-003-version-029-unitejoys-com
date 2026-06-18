document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.from(hero.querySelectorAll(".hero-slide"));
    var dots = Array.from(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

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

    if (prev) {
      prev.addEventListener("click", function () {
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var search = scope.querySelector("[data-card-search]");
    var cards = Array.from(scope.querySelectorAll("[data-card]"));
    var buttons = Array.from(scope.querySelectorAll("[data-filter-year]"));
    var empty = scope.querySelector("[data-empty]");
    var activeYear = "all";
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (search && query) {
      search.value = query;
    }

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function update() {
      var term = normalize(search ? search.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.textContent);
        var year = card.getAttribute("data-year") || "";
        var matchedText = !term || haystack.indexOf(term) !== -1;
        var matchedYear = activeYear === "all" || year === activeYear;
        var matched = matchedText && matchedYear;

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (search) {
      search.addEventListener("input", update);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeYear = button.getAttribute("data-filter-year") || "all";

        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });

        update();
      });
    });

    update();
  });

  document.querySelectorAll(".player-box").forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".player-start");

    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var ready = false;
    var hls = null;

    function attach() {
      if (ready || !stream) {
        return;
      }

      ready = true;

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
        return;
      }

      video.src = stream;
    }

    function begin() {
      attach();
      box.classList.add("is-playing");
      var playAttempt = video.play();

      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(function () {});
      }
    }

    button.addEventListener("click", begin);

    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });

    video.addEventListener("emptied", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      ready = false;
    });
  });
});
