import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, ChevronRight, Maximize2, WifiOff, CloudDownload } from "lucide-react";
import { Link } from "react-router-dom";
import { recordStream, getCachedStream } from "@/lib/streamCache";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { isDownloaded } from "@/lib/offlineDownloads";
import DownloadButton from "@/components/DownloadButton";
import PlayerBrandLoader from "@/components/PlayerBrandLoader";



interface ServerDef {
  id: ServerId;
  label: string;
  build: (tmdbId: string, type: "movie" | "tv", season?: number, episode?: number) => string;
}

export type ServerId = "hd" | "pixaplay" | "movies111";

// HD (vidsrc) is the default. FastStream + 111movies are fallbacks.
export const PLAYER_SERVERS: ServerDef[] = [
  {
    id: "hd",
    label: "Server 1 · HD",
    build: (id, type, s, e) =>
      type === "tv"
        ? `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`
        : `https://vidsrc.pm/embed/movie/${id}`,
  },
  {
    id: "pixaplay",
    label: "Server 2 · FastStream",
    build: (id, type, s, e) =>
      type === "tv"
        ? `https://player.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
        : `https://player.smashystream.com/playere.php?tmdb=${id}`,
  },
  {
    id: "movies111",
    label: "Server 3 · 111Movies",
    build: (id, type, s, e) =>
      type === "tv"
        ? `https://111movies.com/tv/${id}/${s}/${e}`
        : `https://111movies.com/movie/${id}`,
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
}

// NOTE: no `sandbox` attribute — vidsrc.pm refuses to load inside a
// sandboxed frame ("This player cannot be loaded inside a restricted
// (sandboxed) frame"). Redirect / pop-under protection is enforced
// globally by the guard installed in index.html.

const MoviePlayer = ({ tmdbId, type = "movie", season = 1, episode = 1, serverId, onServerChange, title, year, poster, backdrop }: Props) => {
  const initialIdx = Math.max(0, PLAYER_SERVERS.findIndex((s) => s.id === (serverId || "hd")));
  const [serverIdx, setServerIdx] = useState(initialIdx === -1 ? 0 : initialIdx);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const online = useOnlineStatus();
  const [savedOffline, setSavedOffline] = useState(false);

  useEffect(() => {
    let active = true;
    isDownloaded(`${type}-${tmdbId}`).then((d) => {
      if (active) setSavedOffline(d);
    });
    return () => { active = false; };
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
    let active = true;
    setLoading(true);
    setError(false);
    setResolvedSrc("");
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
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builtSrc]);

  useEffect(() => {
    if (!resolvedSrc) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setError(true);
      recordStream(tmdbId, type, server.id, resolvedSrc, false, type === "tv" ? season : undefined, type === "tv" ? episode : undefined);
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
    recordStream(tmdbId, type, server.id, resolvedSrc, true, type === "tv" ? season : undefined, type === "tv" ? episode : undefined);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

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
        className="relative w-full aspect-video overflow-hidden bb-player-shell"
      >
        {resolvedSrc && (
          <iframe
            key={resolvedSrc}
            src={resolvedSrc}
            className="absolute inset-0 w-full h-full"
            onLoad={handleLoad}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
            /* sandbox blocks top-level redirects & pop-unders while keeping
               scripts, playback, forms, presentation and popups (opened tabs
               escape the sandbox so links still work). Omitting
               allow-top-navigation is what stops the player from hijacking
               the tab. */
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox allow-orientation-lock allow-pointer-lock"
            referrerPolicy="origin"
            title="BingBloom Player"
            style={{ border: 0 }}
          />
        )}

        {loading && !error && (
          <PlayerBrandLoader variant="loading" label={`Loading ${server.label}…`} />
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center" style={{ background: "#0A0A0A" }}>
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

        <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 pointer-events-auto">
          <button onClick={toggleFullscreen} title="Fullscreen" className="p-1.5 rounded-md text-white backdrop-blur-md" style={{ background: "rgba(0,0,0,0.55)" }}>
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: "#0A0A0A" }}>
        {PLAYER_SERVERS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => selectServer(i)}
            className="px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition-colors"
            style={{
              background: i === serverIdx ? "#E50914" : "rgba(255,255,255,0.06)",
              color: i === serverIdx ? "#fff" : "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={() => selectServer(serverIdx + 1)}
          title="Next server"
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-semibold text-white"
          style={{ background: "#1f1f1f", border: "1px solid rgba(229,9,20,0.4)" }}
        >
          Next <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {title && (
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#0A0A0A", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <CloudDownload className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10.5px] text-white/55 flex-1">Save this {type === "tv" ? "episode" : "movie"} for offline viewing</span>
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
