import { H as Hls } from "./hls.js";

function setupPlayer(card) {
  const video = card.querySelector("video[data-video-src]");
  const button = card.querySelector("[data-play-button]");
  const overlay = card.querySelector("[data-player-overlay]");

  if (!video || !button) {
    return;
  }

  let hlsInstance = null;
  let isLoaded = false;

  function loadVideo() {
    if (isLoaded) {
      return;
    }

    const source = video.getAttribute("data-video-src");

    if (!source) {
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          console.error("HLS playback error:", data);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    }

    isLoaded = true;
  }

  button.addEventListener("click", function () {
    loadVideo();

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    video.controls = true;
    video.play().catch(function () {
      video.controls = true;
    });
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll("[data-player-card]").forEach(setupPlayer);
