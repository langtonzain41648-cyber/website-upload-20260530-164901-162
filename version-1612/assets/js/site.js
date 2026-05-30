(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector(".mobile-nav-toggle");
    var panel = document.querySelector(".mobile-nav-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;
    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };
    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(parseInt(dot.getAttribute("data-hero-dot"), 10));
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-filter-controls]"));
    groups.forEach(function (controls) {
      var section = controls.closest(".section") || document;
      var input = controls.querySelector("[data-search-input]");
      var region = controls.querySelector("[data-region-filter]");
      var type = controls.querySelector("[data-type-filter]");
      var clear = controls.querySelector("[data-clear-filter]");
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
      var empty = section.querySelector("[data-empty-state]");
      var filter = function () {
        var term = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "all";
        var typeValue = type ? type.value : "all";
        var shown = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-tags") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var matchTerm = !term || text.indexOf(term) !== -1;
          var matchRegion = regionValue === "all" || card.getAttribute("data-region") === regionValue;
          var matchType = typeValue === "all" || card.getAttribute("data-type") === typeValue;
          var visible = matchTerm && matchRegion && matchType;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      };
      if (input) {
        input.addEventListener("input", filter);
      }
      if (region) {
        region.addEventListener("change", filter);
      }
      if (type) {
        type.addEventListener("change", filter);
      }
      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (region) {
            region.value = "all";
          }
          if (type) {
            type.value = "all";
          }
          filter();
        });
      }
      filter();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var source = video ? video.querySelector("source") : null;
      var button = player.querySelector(".play-overlay");
      var message = player.querySelector("[data-player-message]");
      if (!video || !source || !button) {
        return;
      }
      var mediaUrl = source.getAttribute("src");
      var hls = null;
      var loaded = false;
      var showMessage = function (text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add("is-visible");
      };
      var load = function () {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(mediaUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
              showMessage("网络波动，正在重新连接");
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              showMessage("播放恢复中");
            } else {
              showMessage("播放暂时不可用");
              hls.destroy();
            }
          });
        } else {
          video.src = mediaUrl;
        }
      };
      var play = function () {
        load();
        player.classList.add("is-playing");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            player.classList.remove("is-playing");
            showMessage("点击视频区域继续播放");
          });
        }
      };
      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();
