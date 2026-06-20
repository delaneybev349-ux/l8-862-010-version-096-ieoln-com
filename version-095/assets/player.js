function initializePlayer(video, coverButton, streamUrl) {
    var started = false;
    var ready = false;
    var pendingPlay = false;

    function playNow() {
        if (!ready && !video.canPlayType('application/vnd.apple.mpegurl')) {
            return;
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    function attachStream() {
        if (started) {
            playNow();
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            ready = true;
            playNow();
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                ready = true;
                if (pendingPlay) {
                    playNow();
                }
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
            ready = true;
            playNow();
        }
    }

    function begin() {
        pendingPlay = true;

        if (coverButton) {
            coverButton.classList.add('is-hidden');
        }

        attachStream();
    }

    if (coverButton) {
        coverButton.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            begin();
        }
    });

    video.addEventListener('play', attachStream);
}
