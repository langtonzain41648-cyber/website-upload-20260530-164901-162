(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }

    document.addEventListener("DOMContentLoaded", callback);
  }

  var hlsLoadingPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoadingPromise) {
      return hlsLoadingPromise;
    }

    hlsLoadingPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.async = true;

      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error("Hls.js 加载失败"));
        }
      };

      script.onerror = function () {
        reject(new Error("无法加载 Hls.js"));
      };

      document.head.appendChild(script);
    });

    return hlsLoadingPromise;
  }

  function showMessage(wrapper, text) {
    var message = wrapper.querySelector("[data-player-message]");

    if (!message) {
      message = document.createElement("div");
      message.className = "player-message";
      message.setAttribute("data-player-message", "");
      wrapper.appendChild(message);
    }

    message.textContent = text;
  }

  function setupPlayer(wrapper) {
    var video = wrapper.querySelector("video");
    var button = wrapper.querySelector("[data-player-start]");
    var source = wrapper.getAttribute("data-src");

    if (!video || !source) {
      showMessage(wrapper, "播放源未绑定");
      return;
    }

    function bindNativeSource() {
      video.src = source;
    }

    function bindHlsSource(Hls) {
      if (!Hls || !Hls.isSupported()) {
        showMessage(wrapper, "当前浏览器不支持 HLS 播放，请更换新版浏览器。");
        return;
      }

      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          showMessage(wrapper, "视频加载失败，请刷新页面或稍后重试。");
        }
      });

      window.addEventListener("pagehide", function () {
        hls.destroy();
      }, { once: true });
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      bindNativeSource();
    } else {
      loadHlsLibrary()
        .then(bindHlsSource)
        .catch(function () {
          showMessage(wrapper, "HLS 播放组件加载失败，请检查网络后刷新页面。");
        });
    }

    function startPlayback() {
      video.play()
        .then(function () {
          wrapper.classList.add("is-playing");
        })
        .catch(function () {
          showMessage(wrapper, "浏览器阻止了自动播放，请再次点击播放按钮。");
        });
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", function () {
      wrapper.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      wrapper.classList.remove("is-playing");
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  ready(function () {
    var players = document.querySelectorAll("[data-hls-player]");
    Array.prototype.forEach.call(players, setupPlayer);
  });
})();
