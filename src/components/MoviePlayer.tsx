import { useState, useEffect, useRef, useCallback } from "react";
import {
  RefreshCw,
  Expand,
  WifiOff,
  CloudDownload,
  Shield,
  ShieldOff,
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
  badge?: "Fast" | "HD" | "New" | "Alt";
  // Per-source sandbox rules — some providers need popups allowed to play,
  // others work best when locked down.
  sandbox: string;
  build: (tmdbId: string, type: "movie" | "tv", season?: number, episode?: number) => string;
}

export type ServerId = "smashystream" | "movies111" | "vidsrc" | "vidfast";

// Four curated sources. HD is default. Each uses its own iframe sandbox
// so quirky providers still play.
export const PLAYER_SERVERS: ServerDef[] = [
  {
    id: "smashystream",
    label: "HD Stream",
    badge: "HD",
    sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation",
    build: (id, type, s, e) =>
      type === "tv"
        ? `https://player.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
        : `https://player.smashystream.com/playere.php?tmdb=${id}`,
  },
  {
    id: "movies111",
    label: "Fast Stream",
    badge: "Fast",
    // 111movies needs popups + orientation to bootstrap its player.
    sandbox:
      "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-orientation-lock",
    build: (id, type, s, e) =>
      type === "tv"
        ? `https://111movies.com/tv/${id}/${s}/${e}`
        : `https://111movies.com/movie/${id}`,
  },
  {
    id: "vidsrc",
    label: "VidSrc",
    badge: "Alt",
    sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation",
    build: (id, type, s, e) =>
      type === "tv"
        ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
        : `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
  },
  {
    id: "vidfast",
    label: "VidFast",
    badge: "New",
    sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation",
    build: (id, type, s, e) =>
      type === "tv"
        ? `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true`
        : `https://vidfast.pro/movie/${id}?autoPlay=true`,
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
    PLAYER_SERVERS.findIndex((s) => s.id === (serverId || "smashystream")),
  );
  const [serverIdx, setServerIdx] = useState(initialIdx === -1 ? 0 : initialIdx);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const [ended, setEnded] = useState(false);
  const [blockerOn, setBlockerOn] = useState(true);
  const [showBlockerTip, setShowBlockerTip] = useState(true);
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

  // Auto-hide the blocker tip after 8s
  useEffect(() => {
    const t = setTimeout(() => setShowBlockerTip(false), 8000);
    return () => clearTimeout(t);
  }, []);

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
      const cachedUrl = cached?.url;
      const sameHost = (() => {
        try {
          return cachedUrl && new URL(cachedUrl).host === new URL(builtSrc).host;
        } catch {
          return false;
        }
      })();
      setResolvedSrc(sameHost ? cachedUrl! : builtSrc);
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

  // Sandbox is per-source. When blocker is ON, strip popup permissions to
  // prevent redirects. When OFF, allow the provider's native behavior so
  // stubborn embeds (e.g. 111movies) can actually play.
  const sandboxAttr = blockerOn
    ? server.sandbox
        .split(" ")
        .filter((t) => !t.startsWith("allow-popups") && t !== "allow-top-navigation")
        .join(" ")
    : `${server.sandbox} allow-popups allow-popups-to-escape-sandbox`;

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
            key={`${resolvedSrc}-${blockerOn ? "on" : "off"}`}
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

        {/* Blocker instruction tip — appears briefly on load */}
        {showBlockerTip && !error && (
          <div
            className="absolute top-2 left-2 right-2 z-30 flex items-start gap-2 rounded-lg px-3 py-2 text-[10.5px] text-white pointer-events-auto"
            style={{ background: "rgba(10,10,10,0.85)", border: "1px solid rgba(229,9,20,0.55)", backdropFilter: "blur(6px)" }}
          >
            <Shield className="h-3.5 w-3.5 text-[#22c55e] flex-shrink-0 mt-0.5" />
            <p className="leading-snug flex-1">
              <span className="font-semibold">Ad blocker is ON</span> — keep it on to
              avoid redirects. If the video won't play, tap the shield to turn it
              OFF, then back ON once playing.
            </p>
            <button
              onClick={() => setShowBlockerTip(false)}
              className="text-white/60 text-[10px] font-semibold px-1"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {ended && nextItem && onNext && (
          <UpNextCard item={nextItem} onNext={onNext} />
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-background border-t border-border/60 flex-wrap">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
          Source
        </span>
        <div className="flex gap-1 flex-wrap">
          {PLAYER_SERVERS.map((s, i) => {
            const active = i === serverIdx;
            const color =
              s.badge === "HD"
                ? "rgba(229,9,20,"
                : s.badge === "Fast"
                  ? "rgba(34,197,94,"
                  : s.badge === "New"
                    ? "rgba(59,130,246,"
                    : "rgba(234,179,8,";
            return (
              <button
                key={s.id}
                onClick={() => selectServer(i)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-foreground transition focus:outline-none"
                style={{
                  background: active ? `${color}0.25)` : "rgba(127,127,127,0.12)",
                  border: `1px solid ${active ? `${color}0.6)` : "rgba(127,127,127,0.2)"}`,
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => {
              setBlockerOn((v) => !v);
              setShowBlockerTip(false);
            }}
            title={blockerOn ? "Ad blocker ON — tap to disable" : "Ad blocker OFF — tap to enable"}
            aria-label="Toggle ad blocker"
            className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[10px] font-semibold border transition"
            style={{
              background: blockerOn ? "rgba(34,197,94,0.18)" : "rgba(234,179,8,0.18)",
              borderColor: blockerOn ? "rgba(34,197,94,0.55)" : "rgba(234,179,8,0.55)",
              color: blockerOn ? "#22c55e" : "#eab308",
            }}
          >
            {blockerOn ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
            {blockerOn ? "Blocker: ON" : "Blocker: OFF"}
          </button>
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
