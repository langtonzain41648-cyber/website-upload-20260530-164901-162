function initMoviePlayer(source) {
  const shell = document.querySelector('.player-shell');

  if (!shell) {
    return;
  }

  const video = shell.querySelector('video');
  const cover = shell.querySelector('.player-cover');
  let prepared = false;

  const prepare = function () {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return;
    }

    video.src = source;
  };

  const play = function () {
    prepare();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    const action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  };

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}
