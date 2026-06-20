(function() {
  "use strict";

  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");
    var source = shell.getAttribute("data-m3u8") || "";

    if (!video || !button || !source) {
      return;
    }

    var hlsInstance = null;
    var hasStarted = false;

    function playVideo() {
      if (hasStarted) {
        video.play().catch(function() {});
        return;
      }

      hasStarted = true;
      shell.classList.add("is-playing");

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {
            shell.classList.remove("is-playing");
          });
        });

        hlsInstance.on(window.Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().catch(function() {
          shell.classList.remove("is-playing");
        });
      } else {
        video.src = source;
        video.play().catch(function() {
          shell.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", function(event) {
      event.preventDefault();
      playVideo();
    });

    video.addEventListener("play", function() {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function() {
      if (!video.ended) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(setupPlayer);
  });
})();
