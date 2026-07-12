import { useEffect, useRef, useState } from "react";
import {
  Maximize2, WifiOff, CloudDownload, SkipBack, SkipForward, RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { isDownloaded } from "@/lib/offlineDownloads";
import DownloadButton from "@/components/DownloadButton";
import PlayerBrandLoader from "@/components/PlayerBrandLoader";
import HlsVideo from "@/components/HlsVideo";
import { resolveMoviebox, MovieboxPlayback } from "@/lib/movieboxPlayer";

// Legacy compatibility export (some callers still import this type; unused).
export type ServerId = "moviebox";

interface Props {
  tmdbId: string;
  imdbId?: string | null;
  type?: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
  year?: string;
  poster?: string | null;
  backdrop?: string | null;
  onPrev?: () => void;
  onNext?: () => void;
}

const MoviePlayer = ({
  tmdbId, imdbId, type = "movie", season = 1, episode = 1,
  title, year, poster, backdrop, onPrev, onNext,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const online = useOnlineStatus();
  const [savedOffline, setSavedOffline] = useState(false);
  const [state, setState] = useState<MovieboxPlayback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    isDownloaded(`${type}-${tmdbId}`).then((d) => { if (active) setSavedOffline(d); });
    return () => { active = false; };
  }, [type, tmdbId]);

  // Resolve stream via MovieBox whenever title/season/episode changes.
  useEffect(() => {
    if (!title) return;
    let active = true;
    setLoading(true);
    setError(null);
    setState(null);
    resolveMoviebox({
      tmdbId,
      imdbId,
      title,
      year,
      mediaType: type,
      season: type === "tv" ? season : undefined,
      episode: type === "tv" ? episode : undefined,
    }).then((r) => {
      if (!active) return;
      if (!r.ok || !r.url) {
        setError(r.reason || "This title isn't available on MovieBox yet.");
        setLoading(false);
      } else {
        setState(r);
      }
    });
    return () => { active = false; };
  }, [title, year, type, season, episode, tmdbId, imdbId, reloadKey]);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      switch (e.key) {
        case "ArrowLeft": if (onPrev) { e.preventDefault(); onPrev(); } break;
        case "ArrowRight": if (onNext) { e.preventDefault(); onNext(); } break;
        case "f": case "F": e.preventDefault(); toggleFullscreen(); break;
        case "Escape": if (document.fullscreenElement) document.exitFullscreen?.(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);

  if (!online && !savedOffline) {
    return (
      <div className="w-full" style={{ background: "#0A0A0A" }}>
        <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
            <WifiOff className="h-6 w-6 text-white/70" />
          </div>
          <p className="text-white text-sm font-semibold">You're offline</p>
          <p className="text-white/55 text-xs max-w-xs leading-relaxed">
            Connect to the internet to stream this title — or download movies while online.
          </p>
          <Link to="/my-downloads" className="mt-1 inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[11px] font-semibold text-white" style={{ background: "#E50914" }}>
            <CloudDownload className="h-3.5 w-3.5" /> Go to Downloads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ background: "#0A0A0A" }}>
      <div
        ref={containerRef}
        tabIndex={-1}
        className="relative w-full aspect-video overflow-hidden outline-none"
        style={{ contain: "layout paint" }}
      >
        {state?.url && (
          <HlsVideo
            key={`${state.url}::${reloadKey}`}
            src={state.url}
            kind={state.kind || "hls"}
            poster={poster}
            captions={state.captions}
            onReady={() => setLoading(false)}
            onError={(msg) => { setError(msg); setLoading(false); }}
          />
        )}

        {loading && !error && <PlayerBrandLoader variant="loading" label="Finding the best stream…" />}

        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center" style={{ background: "#0A0A0A" }}>
            <img src="/logo-compact.png" alt="BingBloom" className="h-14 w-14 rounded-xl drop-shadow-[0_0_24px_rgba(229,9,20,0.55)]" />
            <p className="text-white text-sm font-semibold tracking-wide">Coming soon</p>
            <p className="text-white/55 text-[10.5px] max-w-xs leading-relaxed">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="flex items-center gap-1.5 text-white text-[11px] px-3 py-1.5 rounded-md font-semibold"
              style={{ background: "#E50914" }}
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={toggleFullscreen}
            title="Fullscreen"
            className="p-1.5 rounded-md text-white backdrop-blur-md"
            style={{ background: "rgba(0,0,0,0.55)" }}
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {(onPrev || onNext) && (
        <div className="flex items-center justify-center gap-2 px-3 py-2" style={{ background: "#0A0A0A", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            onClick={onPrev}
            disabled={!onPrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold text-white disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <SkipBack className="w-3.5 h-3.5" /><span className="hidden sm:inline">Prev</span>
          </button>
          <button
            onClick={onNext}
            disabled={!onNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold text-white disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <span className="hidden sm:inline">Next</span><SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {title && (
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#0A0A0A", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <CloudDownload className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10.5px] text-white/55 flex-1">
            Save this {type === "tv" ? "episode" : "movie"} for offline viewing
          </span>
          <DownloadButton
            size="sm"
            type={type}
            tmdbId={tmdbId}
            title={title}
            year={year}
            poster={poster}
            backdrop={backdrop}
            season={type === "tv" ? season : undefined}
            episode={type === "tv" ? episode : undefined}
          />
        </div>
      )}
    </div>
  );
};

export default MoviePlayer;
