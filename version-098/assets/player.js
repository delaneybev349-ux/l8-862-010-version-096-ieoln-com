import { H as Hls } from "./hls-vendor-dru42stk.js";

export function startPlayer(source, videoId, overlayId) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);
    if (!video || !source) {
        return;
    }
    let loaded = false;
    let hls = null;
    const hideOverlay = () => {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    };
    const load = () => {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    };
    const play = () => {
        hideOverlay();
        load();
        const result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(() => {});
        }
    };
    if (overlay) {
        overlay.addEventListener("click", play);
    }
    video.addEventListener("click", () => {
        if (!loaded) {
            play();
        }
    });
    video.addEventListener("play", hideOverlay);
    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
