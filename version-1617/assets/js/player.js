(function () {
  var video = document.querySelector("[data-player-video]");
  var cover = document.querySelector("[data-player-cover]");
  var button = document.querySelector("[data-player-start]");
  var source = typeof playerSource !== "undefined" ? playerSource : "";
  var loaded = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function startPlayback() {
    attachSource();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    video.controls = true;
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", startPlayback);
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
})();
