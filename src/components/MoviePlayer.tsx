import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  RefreshCw,
  Maximize2,
  WifiOff,
  CloudDownload,
  Shield,
  ShieldOff,
  SkipBack,
  SkipForward,
  Play,
  Pause,
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

const PREROLL_SECONDS = 5;
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
      return localStorage.getItem(BLOCKER_STORAGE_KEY) === "1";
    } catch {
      return false;
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

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const togglePlayPause = () => {
    setPlaying((p) => !p);
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { action: playing ? "pause" : "play" },
        "*",
      );
    } catch {
      /* cross-origin postMessage best-effort */
    }
  };

  const handlePrev = () => {
    if (onPrev) return onPrev();
    selectServer(serverIdx - 1);
  };
  const handleNext = () => {
    if (onNext) return onNext();
    selectServer(serverIdx + 1);
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
    // Force iframe reload with new sandbox
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

  // Keyboard + D-pad shortcuts. Space/Enter → play/pause, arrows → prev/next,
  // F → fullscreen, Esc → exit fullscreen. preventDefault stops page scroll.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore when user is typing in an input
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "Escape":
          if (document.fullscreenElement) document.exitFullscreen?.();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverIdx, onPrev, onNext, playing]);

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

      {/* Prev / Play-Pause / Next controls */}
      <div
        className="flex items-center justify-center gap-2 px-3 py-2"
        style={{ background: "#0A0A0A", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
          title={onPrev ? "Previous episode" : "Previous server"}
        >
          <SkipBack className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>
        <button
          onClick={togglePlayPause}
          className="flex items-center gap-1 px-4 py-1.5 rounded-md text-[11px] font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white"
          style={{ background: "#E50914" }}
          title="Play/Pause"
        >
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{playing ? "Pause" : "Play"}</span>
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
          title={onNext ? "Next episode" : "Next server"}
        >
          <span className="hidden sm:inline">Next</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Server picker — dropdown on ALL breakpoints (works with TV remotes too) */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: "#0A0A0A", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <label htmlFor={selectId} className="text-[10.5px] uppercase tracking-wider text-white/50 font-semibold">
          Source
        </label>
        <div className="relative flex-1">
          <select
            id={selectId}
            value={server.id}
            onChange={(e) => {
              const idx = PLAYER_SERVERS.findIndex((s) => s.id === (e.target.value as ServerId));
              if (idx >= 0) selectServer(idx);
            }}
            className="w-full appearance-none bg-white/8 text-white text-[12px] pl-3 pr-8 py-2 rounded-lg border border-white/10 font-semibold focus:outline-none focus:ring-2 focus:ring-[#E50914]"
          >
            {PLAYER_SERVERS.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#1a1a1a]">
                {s.label}
                {s.badge ? ` — ${s.badge}` : ""}
              </option>
            ))}
          </select>
          {currentBadge && (
            <span
              className="absolute right-8 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                background:
                  currentBadge === "Fast" ? "rgba(34,197,94,0.2)" : "rgba(229,9,20,0.2)",
                color: currentBadge === "Fast" ? "#22c55e" : "#E50914",
                border: `1px solid ${currentBadge === "Fast" ? "rgba(34,197,94,0.4)" : "rgba(229,9,20,0.4)"}`,
              }}
            >
              {currentBadge}
            </span>
          )}
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
