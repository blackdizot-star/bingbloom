import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  RefreshCw,
  Maximize2,
  WifiOff,
  CloudDownload,
  Shield,
  ShieldOff,
  X,
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
  /** Optional episode navigation (TV). If provided, Prev/Next buttons cycle episodes. */
  onPrev?: () => void;
  onNext?: () => void;
}

const PREROLL_SECONDS = 0;
const BLOCKER_STORAGE_KEY = "bb_redirect_blocker";
const APOLOGY_SESSION_KEY = "bb_player_apology_seen";

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
}: Props) => {
  const initialIdx = Math.max(
    0,
    PLAYER_SERVERS.findIndex((s) => s.id === (serverId || "movies111")),
  );
  const [serverIdx, setServerIdx] = useState(initialIdx === -1 ? 0 : initialIdx);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const [preroll, setPreroll] = useState<number>(PREROLL_SECONDS);
  const [playing, setPlaying] = useState(true);
  const [blocker, setBlocker] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(BLOCKER_STORAGE_KEY);
      // Default to ON unless the user has explicitly disabled it.
      return v === null ? true : v === "1";
    } catch {
      return true;
    }
  });
  const [showApology, setShowApology] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(APOLOGY_SESSION_KEY) !== "1";
    } catch {
      return true;
    }
  });
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

  // Reset pre-roll whenever a new server/episode is chosen
  useEffect(() => {
    setPreroll(PREROLL_SECONDS);
    setLoading(true);
    setError(false);
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

  // Pre-roll countdown
  useEffect(() => {
    if (preroll <= 0) return;
    const t = setTimeout(() => setPreroll((p) => Math.max(0, p - 1)), 1000);
    return () => clearTimeout(t);
  }, [preroll]);

  useEffect(() => {
    if (!resolvedSrc || preroll > 0) return;
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
  }, [resolvedSrc, preroll]);

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
        // Lock to landscape on mobile devices for proper video viewing.
        try {
          const orientation = (screen as any).orientation;
          if (orientation && typeof orientation.lock === "function") {
            await orientation.lock("landscape").catch(() => {});
          }
        } catch {
          /* orientation API not supported */
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

  const toggleBlocker = () => {
    setBlocker((b) => {
      const nv = !b;
      try {
        localStorage.setItem(BLOCKER_STORAGE_KEY, nv ? "1" : "0");
      } catch {
        /* ignore */
      }
      return nv;
    });
    setResolvedSrc((s) => s);
  };

  const dismissApology = () => {
    setShowApology(false);
    try {
      sessionStorage.setItem(APOLOGY_SESSION_KEY, "1");
    } catch {
      /* ignore */
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

  // Kill TV/WebView auto-scroll when the iframe steals focus after mount.
  useEffect(() => {
    if (preroll > 0 || !resolvedSrc) return;
    const anchorY = window.scrollY;
    let lastUserInput = 0;
    const markUser = () => {
      lastUserInput = Date.now();
    };
    window.addEventListener("wheel", markUser, { passive: true });
    window.addEventListener("touchstart", markUser, { passive: true });
    const onScroll = () => {
      // If a scroll happens without recent user input, snap back.
      if (Date.now() - lastUserInput > 200) {
        window.scrollTo({ top: anchorY, behavior: "auto" });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Focus the wrapper without scrolling to it.
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
  }, [preroll, resolvedSrc]);

  // Sandbox: strict by default (no top-navigation). Blocker ON strips popups too.
  const sandboxAttr = blocker
    ? "allow-scripts allow-same-origin allow-forms"
    : "allow-scripts allow-same-origin allow-forms allow-popups allow-presentation";

  const currentBadge = server.badge;

  const selectId = useMemo(() => `bb-server-${Math.random().toString(36).slice(2, 8)}`, []);

  if (!online && !savedOffline) {
    return (
      <div className="w-full" style={{ background: "#0A0A0A" }}>
        <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
            <WifiOff className="h-6 w-6 text-white/70" />
          </div>
          <p className="text-white text-sm font-semibold">You're offline</p>
          <p className="text-white/55 text-xs max-w-xs leading-relaxed">
            Connect to the internet to stream this title — or download movies while
            online to watch them anytime, even offline.
          </p>
          <Link
            to="/my-downloads"
            className="mt-1 inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[11px] font-semibold text-white"
            style={{ background: "#E50914" }}
          >
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
        className="relative w-full aspect-video overflow-hidden bb-player-shell outline-none"
        style={{ contain: "layout paint" }}
      >
        {resolvedSrc && preroll <= 0 && (
          <iframe
            ref={iframeRef}
            key={`${resolvedSrc}::${blocker ? "b1" : "b0"}`}
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

        {/* 5s pre-roll notice */}
        {preroll > 0 && (
          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 px-6 text-center"
            style={{ background: "rgba(0,0,0,0.92)" }}
          >
            <div
              className="grid place-items-center h-12 w-12 rounded-full"
              style={{ background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.4)" }}
            >
              <span className="text-white font-bold text-lg">{preroll}</span>
            </div>
            <p className="text-white text-[12.5px] font-semibold max-w-sm leading-snug">
              We've added more streaming sources
            </p>
            <p className="text-white/65 text-[11px] max-w-sm leading-relaxed">
              A few sources may still try to redirect. Please bear with us while
              we lock them down. Starting in {preroll}s…
            </p>
            <button
              onClick={() => setPreroll(0)}
              className="mt-1 rounded-md px-3 py-1.5 text-[11px] font-semibold text-white"
              style={{ background: "#E50914" }}
            >
              Skip
            </button>
          </div>
        )}

        {loading && !error && preroll <= 0 && (
          <PlayerBrandLoader variant="loading" label={`Loading ${server.label}…`} />
        )}

        {error && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center"
            style={{ background: "#0A0A0A" }}
          >
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
              className="flex items-center gap-1.5 text-white text-[11px] px-3 py-1.5 rounded-md font-semibold pointer-events-auto"
              style={{ background: "#E50914" }}
            >
              <RefreshCw className="w-3 h-3" /> Try next server
            </button>
          </div>
        )}

        {/* One-time apology popup */}
        {showApology && preroll <= 0 && (
          <div className="absolute bottom-3 left-3 right-3 z-40 flex items-start gap-2 rounded-lg p-2.5 pointer-events-auto"
            style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(229,9,20,0.4)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[11px] font-semibold">We're sorry for occasional redirects</p>
              <p className="text-white/65 text-[10px] leading-snug mt-0.5">
                We've expanded to more sources. Some may still redirect — we're actively working on it.
              </p>
            </div>
            <button
              onClick={dismissApology}
              className="text-white text-[10.5px] font-semibold px-2 py-1 rounded-md"
              style={{ background: "#E50914" }}
            >
              Got it
            </button>
            <button onClick={dismissApology} className="p-1 text-white/60 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={toggleBlocker}
            title={blocker ? "Redirect Blocker: ON" : "Redirect Blocker: OFF"}
            className="flex items-center gap-1 p-1.5 rounded-md text-white backdrop-blur-md text-[10px] font-semibold"
            style={{
              background: blocker ? "rgba(229,9,20,0.75)" : "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {blocker ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
            <span className="hidden sm:inline">Blocker {blocker ? "ON" : "OFF"}</span>
          </button>
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

      {/* Compact source toggle */}
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{ background: "#0A0A0A", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span className="text-[9px] uppercase tracking-wider text-white/45 font-semibold">
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
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white transition focus:outline-none"
                style={{
                  background: active
                    ? isFast
                      ? "rgba(34,197,94,0.25)"
                      : "rgba(229,9,20,0.25)"
                    : "rgba(255,255,255,0.06)",
                  border: `1px solid ${
                    active
                      ? isFast
                        ? "rgba(34,197,94,0.6)"
                        : "rgba(229,9,20,0.6)"
                      : "rgba(255,255,255,0.1)"
                  }`,
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {title && (
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ background: "#0A0A0A", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
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
