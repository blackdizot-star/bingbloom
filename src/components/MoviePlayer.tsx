import { useState, useEffect, useRef } from "react";
import { RefreshCw, Expand, WifiOff, CloudDownload } from "lucide-react";
import { Link } from "react-router-dom";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { isDownloaded } from "@/lib/offlineDownloads";
import DownloadButton from "@/components/DownloadButton";
import PlayerBrandLoader from "@/components/PlayerBrandLoader";
import PreRollAd from "@/components/PreRollAd";

export type ServerId = "vidsrc" | "111movies" | "smashy" | "videasy";

export const PLAYER_SERVERS: { id: ServerId; label: string }[] = [
  { id: "vidsrc", label: "VidSrc" },
  { id: "111movies", label: "111Movies" },
  { id: "smashy", label: "Smashy" },
  { id: "videasy", label: "Videasy" },
];

const embedUrl = (
  server: ServerId,
  tmdbId: string,
  type: "movie" | "tv",
  season: number,
  episode: number,
): string => {
  const isTv = type === "tv";
  switch (server) {
    case "111movies":
      return isTv
        ? `https://111movies.com/tv/${tmdbId}/${season}/${episode}`
        : `https://111movies.com/movie/${tmdbId}`;
    case "smashy":
      return isTv
        ? `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`
        : `https://player.smashy.stream/movie/${tmdbId}`;
    case "videasy":
      return isTv
        ? `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`
        : `https://player.videasy.net/movie/${tmdbId}`;
    case "vidsrc":
    default:
      return isTv
        ? `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${tmdbId}`;
  }
};

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
  serverId,
  onServerChange,
  title,
  year,
  poster,
  backdrop,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [internalServer, setInternalServer] = useState<ServerId>("vidsrc");
  const server = serverId ?? internalServer;
  const containerRef = useRef<HTMLDivElement>(null);
  const online = useOnlineStatus();
  const [savedOffline, setSavedOffline] = useState(false);
  const [adDone, setAdDone] = useState(false);

  useEffect(() => {
    setAdDone(false);
  }, [tmdbId, type, season, episode]);

  const src = embedUrl(server, tmdbId, type, season, episode);

  const pickServer = (id: ServerId) => {
    setInternalServer(id);
    onServerChange?.(id);
  };

  useEffect(() => {
    let active = true;
    isDownloaded(`${type}-${tmdbId}`).then((d) => active && setSavedOffline(d));
    return () => {
      active = false;
    };
  }, [type, tmdbId]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const t = setTimeout(() => setLoading(false), 6000);
    return () => clearTimeout(t);
  }, [src, attempt]);

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
        {adDone && (
          <iframe
            key={`${src}-${attempt}`}
            src={src}
            title={title || "Player"}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="origin"
            onLoad={() => setLoading(false)}
            onError={() => setError(true)}
          />
        )}

        {!adDone && <PreRollAd seed={`${type}-${tmdbId}-${season}-${episode}`} onFinish={() => setAdDone(true)} />}

        {adDone && loading && !error && <PlayerBrandLoader variant="loading" label="Loading stream…" />}

        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center bg-black">
            <img src="/logo-compact.png" alt="MovieNoir" className="h-14 w-14 rounded-xl" />
            <p className="text-white text-sm font-semibold tracking-wide">Stream unavailable</p>
            <p className="text-white/55 text-[10.5px] max-w-xs leading-relaxed">
              Try another source below.
            </p>
            <button
              onClick={() => setAttempt((a) => a + 1)}
              className="flex items-center gap-1.5 text-white text-[11px] px-3 py-1.5 rounded-md font-semibold bg-primary"
            >
              <RefreshCw className="w-3 h-3" /> Try again
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-background border-t border-border/60 flex-wrap">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
          Source
        </span>
        <div className="flex gap-1 flex-wrap">
          {PLAYER_SERVERS.map((s) => {
            const active = s.id === server;
            return (
              <button
                key={s.id}
                onClick={() => pickServer(s.id)}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                  active
                    ? "bg-primary/25 border border-primary/60 text-foreground"
                    : "bg-foreground/10 border border-border text-foreground/80"
                }`}
              >
                {s.label}
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

export default MoviePlayer;
