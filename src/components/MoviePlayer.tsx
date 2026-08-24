import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, Expand, WifiOff, CloudDownload } from "lucide-react";
import { Link } from "react-router-dom";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { isDownloaded } from "@/lib/offlineDownloads";
import DownloadButton from "@/components/DownloadButton";
import PlayerBrandLoader from "@/components/PlayerBrandLoader";
import {
  resolveMovieboxDownloads,
  movieboxProxyUrl,
  type MovieboxDownload,
} from "@/lib/moviebox";

// Single source: MovieBox (the first download source) is used directly as the
// stream URL for the video player.
export type ServerId = "moviebox";

export const PLAYER_SERVERS = [{ id: "moviebox" as ServerId, label: "MovieNoir Stream" }];

interface Props {
  tmdbId: string;
  type?: "movie" | "tv";
  season?: number;
  episode?: number;
  serverId?: ServerId;
  onServerChange?: (id: ServerId) => void;
  title?: string;
  year?: string;
  poster?: string | null;
  backdrop?: string | null;
  onPrev?: () => void;
  onNext?: () => void;
  nextItem?: { title: string; poster?: string | null; subtitle?: string } | null;
}

const MoviePlayer = ({
  tmdbId,
  type = "movie",
  season = 1,
  episode = 1,
  title,
  year,
  poster,
  backdrop,
  onNext,
  nextItem,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [tracks, setTracks] = useState<{ lang: string; url: string }[]>([]);
  const [qualities, setQualities] = useState<MovieboxDownload[]>([]);
  const [ended, setEnded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const online = useOnlineStatus();
  const [savedOffline, setSavedOffline] = useState(false);

  useEffect(() => {
    let active = true;
    isDownloaded(`${type}-${tmdbId}`).then((d) => active && setSavedOffline(d));
    return () => {
      active = false;
    };
  }, [type, tmdbId]);

  // Resolve the stream: bundled stream links first, MovieBox resolver as backup.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setEnded(false);
    setStreamUrl("");
    (async () => {
      const local = await getLocalStreams(tmdbId, type, season, episode);
      if (!active) return;
      if (local.length) {
        const list: MovieboxDownload[] = local.map((s) => ({
          url: s.u,
          resolution: s.r,
        })) as MovieboxDownload[];
        setQualities(list);
        setTracks(
          local[0].s ? [{ lang: "en", url: movieboxProxyUrl(local[0].s) }] : [],
        );
        setStreamUrl(movieboxProxyUrl(local[0].u));
        setLoading(false);
        return;
      }

      if (!title) {
        setError(true);
        setLoading(false);
        return;
      }
      const res = await resolveMovieboxDownloads({
        title,
        year,
        mediaType: type === "tv" ? "tv" : "movie",
        season: type === "tv" ? season : 0,
        episode: type === "tv" ? episode : 0,
      });
      if (!active) return;
      const list = (res.downloads || []).slice().sort((a, b) => b.resolution - a.resolution);
      if (!res.ok || list.length === 0) {
        setError(true);
        setLoading(false);
        return;
      }
      setQualities(list);
      setTracks(res.captions || []);
      setStreamUrl(movieboxProxyUrl(list[0].url));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [tmdbId, title, year, type, season, episode, attempt]);

  const pickQuality = useCallback((d: MovieboxDownload) => {
    const v = videoRef.current;
    const t = v?.currentTime || 0;
    setStreamUrl(movieboxProxyUrl(d.url));
    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = t;
        videoRef.current.play().catch(() => {});
      }
    });
  }, []);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
        try {
          const o = (screen as any).orientation;
          if (o?.lock) await o.lock("landscape").catch(() => {});
        } catch {
          /* ignore */
        }
      } else {
        try {
          (screen as any).orientation?.unlock?.();
        } catch {
          /* ignore */
        }
        await document.exitFullscreen?.();
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!online && !savedOffline) {
    return (
      <div className="w-full bg-background">
        <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/5">
            <WifiOff className="h-6 w-6 text-foreground/70" />
          </div>
          <p className="text-foreground text-sm font-semibold">You're offline</p>
          <p className="text-muted-foreground text-xs max-w-xs leading-relaxed">
            Connect to the internet to stream this title — or download titles while
            online to watch them anytime.
          </p>
          <Link
            to="/my-downloads"
            className="mt-1 inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[11px] font-semibold text-primary-foreground bg-primary"
          >
            <CloudDownload className="h-3.5 w-3.5" /> Go to Downloads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background">
      <div
        ref={containerRef}
        tabIndex={-1}
        className="relative w-full aspect-video overflow-hidden bb-player-shell outline-none bg-black"
      >
        {streamUrl && (
          <video
            ref={videoRef}
            key={streamUrl}
            src={streamUrl}
            poster={backdrop || poster || undefined}
            controls
            autoPlay
            playsInline
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full bg-black"
            onEnded={() => setEnded(true)}
            onError={() => setError(true)}
          >
            {tracks.map((t) => (
              <track key={t.url} kind="subtitles" srcLang={t.lang} label={t.lang} src={t.url} />
            ))}
          </video>
        )}

        {loading && !error && <PlayerBrandLoader variant="loading" label="Loading stream…" />}

        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center bg-black">
            <img src="/logo-compact.png" alt="MovieNoir" className="h-14 w-14 rounded-xl" />
            <p className="text-white text-sm font-semibold tracking-wide">Stream unavailable</p>
            <p className="text-white/55 text-[10.5px] max-w-xs leading-relaxed">
              We couldn't find a stream for this title right now.
            </p>
            <button
              onClick={() => setAttempt((a) => a + 1)}
              className="flex items-center gap-1.5 text-white text-[11px] px-3 py-1.5 rounded-md font-semibold bg-primary"
            >
              <RefreshCw className="w-3 h-3" /> Try again
            </button>
          </div>
        )}

        {ended && nextItem && onNext && <UpNextCard item={nextItem} onNext={onNext} />}
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-background border-t border-border/60 flex-wrap">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
          Quality
        </span>
        <div className="flex gap-1">
          {qualities.slice(0, 4).map((q) => {
            const active = streamUrl === movieboxProxyUrl(q.url);
            return (
              <button
                key={q.url}
                onClick={() => pickQuality(q)}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                  active
                    ? "bg-primary/25 border border-primary/60 text-foreground"
                    : "bg-foreground/10 border border-border text-foreground/80"
                }`}
              >
                {q.resolution}p
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {title && (
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
          )}
          <button
            onClick={toggleFullscreen}
            title="Fullscreen (F)"
            aria-label="Fullscreen"
            className="grid place-items-center h-7 w-7 rounded-md text-foreground hover:bg-foreground/10 border border-border/60"
          >
            <Expand className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const UpNextCard = ({
  item,
  onNext,
}: {
  item: { title: string; poster?: string | null; subtitle?: string };
  onNext: () => void;
}) => {
  const [n, setN] = useState(5);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (n <= 0) {
      onNext();
      return;
    }
    const t = setTimeout(() => setN((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [n, onNext]);

  if (dismissed) return null;

  return (
    <div
      className="absolute bottom-3 right-3 z-30 flex items-center gap-2 rounded-lg p-2 pointer-events-auto max-w-[260px]"
      style={{
        background: "rgba(10,10,10,0.92)",
        border: "1px solid rgba(255,45,143,0.5)",
        backdropFilter: "blur(8px)",
      }}
    >
      {item.poster && (
        <img src={item.poster} alt="" className="w-10 h-14 rounded object-cover flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-wider text-[#FF2D8F]">
          Up Next in {n}s
        </p>
        <p className="text-[11px] font-semibold text-white truncate">{item.title}</p>
        {item.subtitle && <p className="text-[9px] text-white/50 truncate">{item.subtitle}</p>}
        <div className="flex gap-1 mt-1">
          <button
            onClick={() => onNext()}
            className="text-[9.5px] font-semibold text-white px-2 py-0.5 rounded bg-primary"
          >
            Play now
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-[9.5px] text-white/70 px-1.5 py-0.5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoviePlayer;
