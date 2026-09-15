import { useState, useEffect, useRef } from "react";
import { RefreshCw, Expand, WifiOff, CloudDownload, Bookmark, BookmarkCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { isDownloaded } from "@/lib/offlineDownloads";
import DownloadButton from "@/components/DownloadButton";
import PlayerBrandLoader from "@/components/PlayerBrandLoader";
import PreRollAd from "@/components/PreRollAd";
import { isInMyList, toggleMyList } from "@/hooks/useMyList";

export type ServerId =
  | "vidbolt"
  | "cinesrc"
  | "vidcore"
  | "vidnest"
  | "vidlink"
  | "vidsrcme"
  | "vidgod"
  | "filmu";

export const PLAYER_SERVERS: { id: ServerId; label: string; origin: string }[] = [
  { id: "vidbolt", label: "VidBolt", origin: "https://vidbolt.xyz" },
  { id: "cinesrc", label: "Nova", origin: "https://cinesrc.st" },
  { id: "vidcore", label: "Crimson", origin: "https://vidcore.io" },
  { id: "vidnest", label: "Helix", origin: "https://vidnest.fun" },
  { id: "vidlink", label: "Astra", origin: "https://vidlink.pro" },
  { id: "vidsrcme", label: "Ironclad", origin: "https://vidsrcme.ru" },
  { id: "vidgod", label: "Vale", origin: "https://vidgod.site" },
  { id: "filmu", label: "Lumen", origin: "https://embed.filmu.in" },
];

const embedUrl = (
  server: ServerId,
  tmdbId: string,
  type: "movie" | "tv",
  season: number,
  episode: number,
): string => {
  const origin =
    PLAYER_SERVERS.find((s) => s.id === server)?.origin || PLAYER_SERVERS[0].origin;
  return type === "tv"
    ? `${origin}/tv/${tmdbId}/${season}/${episode}`
    : `${origin}/movie/${tmdbId}`;
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
  const [internalServer, setInternalServer] = useState<ServerId>("vidbolt");
  const server = serverId ?? internalServer;
  const containerRef = useRef<HTMLDivElement>(null);
  const online = useOnlineStatus();
  const [savedOffline, setSavedOffline] = useState(false);
  const [adDone, setAdDone] = useState(false);
  const watchlistId = `${type}-${tmdbId}`;
  const [inWatchlist, setInWatchlist] = useState(() => isInMyList(watchlistId));

  useEffect(() => {
    setAdDone(false);
    setInWatchlist(isInMyList(`${type}-${tmdbId}`));
  }, [tmdbId, type, season, episode]);

  const src = embedUrl(server, tmdbId, type, season, episode);

  const pickServer = (id: ServerId) => {
    setInternalServer(id);
    onServerChange?.(id);
  };

  const toggleWatchlist = () => {
    if (!title) return;
    const added = toggleMyList({
      id: watchlistId,
      title,
      thumbnail: poster || backdrop || "",
      channel: year || (type === "tv" ? "TV Show" : "Movie"),
      views: "",
      duration: "",
    });
    setInWatchlist(added);
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

      <div className="flex items-center gap-1.5 border-t border-border/60 bg-background px-3 py-2">
        <label htmlFor={`source-${tmdbId}`} className="sr-only">Stream source</label>
        <select
          id={`source-${tmdbId}`}
          value={server}
          onChange={(event) => pickServer(event.target.value as ServerId)}
          className="h-8 min-w-0 flex-1 rounded-md border border-border bg-card px-2 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary sm:max-w-40"
          aria-label="Stream source"
        >
          {PLAYER_SERVERS.map((source) => (
            <option key={source.id} value={source.id}>{source.label}</option>
          ))}
        </select>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {title && (
            <>
              <button
                type="button"
                onClick={toggleWatchlist}
                title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                className="grid h-8 w-8 place-items-center rounded-md border border-border/60 text-foreground hover:bg-foreground/10"
              >
                {inWatchlist ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
              </button>
              <DownloadButton
                size="icon"
                type={type}
                tmdbId={tmdbId}
                title={title}
                year={year}
                poster={poster}
                backdrop={backdrop}
                season={type === "tv" ? season : undefined}
                episode={type === "tv" ? episode : undefined}
              />
            </>
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
