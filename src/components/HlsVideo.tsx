import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  kind: "hls" | "mp4";
  poster?: string | null;
  autoPlay?: boolean;
  onReady?: () => void;
  onError?: (message: string) => void;
  captions?: { lang: string; url: string }[];
  className?: string;
}

/**
 * Native <video> that plays either an .mp4 (direct src) or an .m3u8 (via HLS.js
 * on non-Safari, native on Safari/iOS). Handles fatal-error recovery.
 */
const HlsVideo = ({ src, kind, poster, autoPlay = true, onReady, onError, captions = [], className }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Cleanup any prior HLS instance
    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch { /* ignore */ }
      hlsRef.current = null;
    }

    const nativeHls = video.canPlayType("application/vnd.apple.mpegurl");

    if (kind === "hls" && Hls.isSupported() && !nativeHls) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => onReady?.());
      let recovered = false;
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data?.fatal) return;
        if (!recovered) {
          recovered = true;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
        }
        onError?.(data?.details || "Playback failed");
      });
    } else {
      video.src = src;
      const handleLoaded = () => onReady?.();
      const handleError = () => onError?.("Playback failed");
      video.addEventListener("loadeddata", handleLoaded);
      video.addEventListener("error", handleError);
      return () => {
        video.removeEventListener("loadeddata", handleLoaded);
        video.removeEventListener("error", handleError);
      };
    }

    return () => {
      if (hlsRef.current) {
        try { hlsRef.current.destroy(); } catch { /* ignore */ }
        hlsRef.current = null;
      }
    };
  }, [src, kind, onReady, onError]);

  return (
    <video
      ref={videoRef}
      poster={poster || undefined}
      controls
      autoPlay={autoPlay}
      playsInline
      crossOrigin="anonymous"
      className={className || "absolute inset-0 w-full h-full bg-black"}
    >
      {captions.map((c, i) => (
        <track key={i} kind="subtitles" srcLang={c.lang} src={c.url} default={i === 0} />
      ))}
    </video>
  );
};

export default HlsVideo;
