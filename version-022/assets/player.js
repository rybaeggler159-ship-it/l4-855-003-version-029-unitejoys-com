function initPlayer(videoId, sourceUrl) {
  var video = document.getElementById(videoId);

  if (!video) {
    return;
  }

  var box = video.closest(".player-box");
  var overlay = box ? box.querySelector(".player-overlay") : null;
  var hlsInstance = null;
  var loaded = false;

  function loadVideo() {
    if (!loaded) {
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function() {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", loadVideo);
  }

  video.addEventListener("click", function() {
    if (video.paused) {
      loadVideo();
    }
  });

  video.addEventListener("play", function() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
