(function () {
  function bootPlayer(source) {
    var video = document.getElementById("video-player");
    var cover = document.querySelector(".player-cover");
    var hls = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = source;
      }
    }

    function begin() {
      attach();
      video.setAttribute("controls", "controls");

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {
          video.muted = true;
          video.play().catch(function () {});
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        begin();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.bootPlayer = bootPlayer;
})();
