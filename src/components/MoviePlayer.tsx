import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  RefreshCw,
  Expand,
  WifiOff,
  CloudDownload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { recordStream, getCachedStream } from "@/lib/streamCache";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { isDownloaded } from "@/lib/offlineDownloads";
import DownloadButton from "@/components/DownloadButton";
import PlayerBrandLoader from "@/components/PlayerBrandLoader";

interface ServerDef {
  id: ServerId;
  label: string;
  badge?: "Fast" | "HD" | "New";
  build: (tmdbId: string, type: "movie" | "tv", season?: number, episode?: number) => string;
}

export type ServerId = "movies111" | "smashystream";

// Only two curated sources: 111Movies (Fast) and SmashyStream (HD).
export const PLAYER_SERVERS: ServerDef[] = [
  {
    id: "movies111",
    label: "Fast Stream",
    badge: "Fast",
    build: (id, type, s, e) =>
      type === "tv"
        ? `https://111movies.com/tv/${id}/${s}/${e}`
        : `https://111movies.com/movie/${id}`,
  },
  {
    id: "smashystream",
    label: "HD Stream",
    badge: "HD",
    build: (id, type, s, e) =>
      type === "tv"
        ? `https://player.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
        : `https://player.smashystream.com/playere.php?tmdb=${id}`,
  },
];

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
  onPrev,
  onNext,
  nextItem,
}: Props) => {
  const initialIdx = Math.max(
    0,
    PLAYER_SERVERS.findIndex((s) => s.id === (serverId || "movies111")),
  );
  const [serverIdx, setServerIdx] = useState(initialIdx === -1 ? 0 : initialIdx);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const [ended, setEnded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const online = useOnlineStatus();
  const [savedOffline, setSavedOffline] = useState(false);

  useEffect(() => {
    let active = true;
    isDownloaded(`${type}-${tmdbId}`).then((d) => {
      if (active) setSavedOffline(d);
    });
    return () => {
      active = false;
    };
  }, [type, tmdbId]);

  useEffect(() => {
    if (!serverId) return;
    const i = PLAYER_SERVERS.findIndex((s) => s.id === serverId);
    if (i >= 0 && i !== serverIdx) setServerIdx(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  const server = PLAYER_SERVERS[serverIdx];
  const builtSrc = server.build(tmdbId, type, season, episode);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setEnded(false);
    setResolvedSrc("");
    let active = true;
    (async () => {
      const cached = await getCachedStream(
        tmdbId,
        type,
        server.id,
        type === "tv" ? season : undefined,
        type === "tv" ? episode : undefined,
      );
      if (!active) return;
      setResolvedSrc(cached?.url || builtSrc);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builtSrc]);

  useEffect(() => {
    if (!resolvedSrc) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setError(true);
      recordStream(
        tmdbId,
        type,
        server.id,
        resolvedSrc,
        false,
        type === "tv" ? season : undefined,
        type === "tv" ? episode : undefined,
      );
    }, 15000);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedSrc]);

  const selectServer = useCallback(
    (idx: number) => {
      const i = ((idx % PLAYER_SERVERS.length) + PLAYER_SERVERS.length) % PLAYER_SERVERS.length;
      setServerIdx(i);
      onServerChange?.(PLAYER_SERVERS[i].id);
    },
    [onServerChange],
  );

  const handleLoad = () => {
    clearTimeout(timerRef.current);
    setLoading(false);
    setError(false);
    recordStream(
      tmdbId,
      type,
      server.id,
      resolvedSrc,
      true,
      type === "tv" ? season : undefined,
      type === "tv" ? episode : undefined,
    );
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
        try {
          const orientation = (screen as any).orientation;
          if (orientation && typeof orientation.lock === "function") {
            await orientation.lock("landscape").catch(() => {});
          }
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
      /* fullscreen not permitted */
    }
  };

  // Keyboard shortcuts: F fullscreen, Esc exit.
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

  // Listen for postMessage 'ended' events from iframe players
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data;
      if (!data) return;
      const t = typeof data === "string" ? data : data.type || data.event || data.action;
      if (typeof t === "string" && /ended|complete|finish/i.test(t)) {
        setEnded(true);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Prevent iframe scroll-jack
  useEffect(() => {
    if (!resolvedSrc) return;
    const anchorY = window.scrollY;
    let lastUserInput = 0;
    const markUser = () => {
      lastUserInput = Date.now();
    };
    window.addEventListener("wheel", markUser, { passive: true });
    window.addEventListener("touchstart", markUser, { passive: true });
    const onScroll = () => {
      if (Date.now() - lastUserInput > 200) {
        window.scrollTo({ top: anchorY, behavior: "auto" });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    try {
      containerRef.current?.focus({ preventScroll: true } as FocusOptions);
    } catch {
      /* ignore */
    }
    const stop = setTimeout(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", markUser);
      window.removeEventListener("touchstart", markUser);
    }, 1500);
    return () => {
      clearTimeout(stop);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", markUser);
      window.removeEventListener("touchstart", markUser);
    };
  }, [resolvedSrc]);

  // Blocker default ON — no UI toggle. Strict sandbox strips popups.
  const sandboxAttr = "allow-scripts allow-same-origin allow-forms";

  if (!online && !savedOffline) {
    return (
      <div className="w-full bg-background">
        <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/5">
            <WifiOff className="h-6 w-6 text-foreground/70" />
          </div>
          <p className="text-foreground text-sm font-semibold">You're offline</p>
          <p className="text-muted-foreground text-xs max-w-xs leading-relaxed">
            Connect to the internet to stream this title — or download movies while
            online to watch them anytime, even offline.
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
        style={{ contain: "layout paint" }}
      >
        {resolvedSrc && (
          <iframe
            ref={iframeRef}
            key={resolvedSrc}
            src={resolvedSrc}
            className="absolute inset-0 w-full h-full"
            onLoad={handleLoad}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
            sandbox={sandboxAttr}
            referrerPolicy="no-referrer"
            title="BingBloom Player"
            style={{ border: 0 }}
          />
        )}

        {loading && !error && (
          <PlayerBrandLoader variant="loading" label={`Loading ${server.label}…`} />
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center bg-black">
            <img
              src="/logo-compact.png"
              alt="BingBloom"
              className="h-14 w-14 rounded-xl drop-shadow-[0_0_24px_rgba(229,9,20,0.55)]"
            />
            <p className="text-white text-sm font-semibold tracking-wide">Coming soon</p>
            <p className="text-white/55 text-[10.5px] max-w-xs leading-relaxed">
              This title isn't streamable on {server.label} yet. Try another server.
            </p>
            <button
              onClick={() => selectServer(serverIdx + 1)}
              className="flex items-center gap-1.5 text-white text-[11px] px-3 py-1.5 rounded-md font-semibold pointer-events-auto bg-primary"
            >
              <RefreshCw className="w-3 h-3" /> Try next server
            </button>
          </div>
        )}

        {/* Up Next card — only shows once we detect the video actually ended */}
        {ended && nextItem && onNext && (
          <UpNextCard item={nextItem} onNext={onNext} />
        )}
      </div>

      {/* Single-row toolbar: Source pills + Download + Fullscreen */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 bg-background border-t border-border/60 flex-wrap"
      >
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
          Source
        </span>
        <div className="flex gap-1">
          {PLAYER_SERVERS.map((s, i) => {
            const active = i === serverIdx;
            const isFast = s.badge === "Fast";
            return (
              <button
                key={s.id}
                onClick={() => selectServer(i)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-foreground transition focus:outline-none"
                style={{
                  background: active
                    ? isFast
                      ? "rgba(34,197,94,0.25)"
                      : "rgba(229,9,20,0.25)"
                    : "rgba(127,127,127,0.12)",
                  border: `1px solid ${
                    active
                      ? isFast
                        ? "rgba(34,197,94,0.6)"
                        : "rgba(229,9,20,0.6)"
                      : "rgba(127,127,127,0.2)"
                  }`,
                }}
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
      style={{ background: "rgba(10,10,10,0.92)", border: "1px solid rgba(229,9,20,0.5)", backdropFilter: "blur(8px)" }}
    >
      {item.poster && (
        <img src={item.poster} alt="" className="w-10 h-14 rounded object-cover flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-wider text-[#E50914]">Up Next in {n}s</p>
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
