import { H as Hls } from "./video-vendor.js";

function setupPlayer(box) {
  var video = box.querySelector("video");
  var start = box.querySelector(".player-start");
  var stream = box.getAttribute("data-stream");
  var loaded = false;
  var hls = null;

  function loadStream() {
    if (loaded || !video || !stream) {
      return;
    }
    loaded = true;
    box.classList.add("is-loading");

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        box.classList.remove("is-loading");
      });
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      box.classList.remove("is-loading");
    } else {
      video.src = stream;
      box.classList.remove("is-loading");
    }
  }

  function playVideo() {
    loadStream();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        box.classList.remove("is-playing");
      });
    }
  }

  if (start) {
    start.addEventListener("click", function () {
      playVideo();
    });
  }

  video.addEventListener("play", function () {
    box.classList.add("is-playing");
  });

  video.addEventListener("pause", function () {
    box.classList.remove("is-playing");
  });

  video.addEventListener("loadeddata", function () {
    box.classList.remove("is-loading");
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll(".player-box[data-stream]").forEach(setupPlayer);
