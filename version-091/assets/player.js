(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function attachStream(video, source) {
    if (!source || video.dataset.ready === "1") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.dataset.ready = "1";
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.dataset.ready = "1";
      video.hlsController = hls;
      return;
    }
    video.src = source;
    video.dataset.ready = "1";
  }

  function setupPlayer(shell) {
    var video = shell.querySelector("video[data-hls]");
    var button = shell.querySelector(".player-start");
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute("data-hls");
    attachStream(video, source);

    function start() {
      attachStream(video, source);
      video.setAttribute("controls", "controls");
      shell.classList.add("is-playing");
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove("is-playing");
      }
    });
  }

  onReady(function () {
    document.querySelectorAll(".player-shell").forEach(setupPlayer);
  });
})();
