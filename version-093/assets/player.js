import { H as Hls } from "./hls-vendor-DrU42sTK.js";

export function setupPlayer(videoId, layerId, streamUrl) {
    const video = document.getElementById(videoId);
    const layer = document.getElementById(layerId);
    let loaded = false;

    if (!video || !streamUrl) {
        return;
    }

    function loadVideo() {
        if (loaded) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
        loaded = true;
    }

    async function playVideo() {
        loadVideo();
        video.controls = true;
        if (layer) {
            layer.classList.add("is-hidden");
        }
        try {
            await video.play();
        } catch (error) {
            video.controls = true;
        }
    }

    if (layer) {
        layer.addEventListener("click", playVideo);
    }

    video.addEventListener("click", () => {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", () => {
        if (layer) {
            layer.classList.add("is-hidden");
        }
    });
}
