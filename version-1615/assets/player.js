(function() {
  function setup(stream) {
    var wrap = document.querySelector("[data-player]");
    if (!wrap) {
      return;
    }

    var video = wrap.querySelector("[data-video]");
    var trigger = wrap.querySelector("[data-play]");
    var mounted = false;
    var hls = null;

    function mount() {
      if (mounted || !video) {
        return;
      }
      mounted = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      mount();
      wrap.classList.add("is-playing");
      var playing = video.play();
      if (playing && typeof playing.catch === "function") {
        playing.catch(function() {
          wrap.classList.remove("is-playing");
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function() {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener("play", function() {
        wrap.classList.add("is-playing");
      });

      video.addEventListener("ended", function() {
        wrap.classList.remove("is-playing");
      });
    }

    window.addEventListener("pagehide", function() {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    setup: setup
  };
})();
