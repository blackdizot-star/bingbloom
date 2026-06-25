import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle, RefreshCw, ChevronRight, Maximize2, Shield } from "lucide-react";
import { recordStream, getCachedStream } from "@/lib/streamCache";

export type ServerId = "hd" | "pixaplay";

interface ServerDef {
  id: ServerId;
  label: string;
  build: (tmdbId: string, type: "movie" | "tv", season?: number, episode?: number) => string;
}

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
];

interface Props {
  tmdbId: string;
  type?: "movie" | "tv";
  season?: number;
  episode?: number;
  serverId?: ServerId;
  onServerChange?: (id: ServerId) => void;
}

// When ad-block is ON: omit allow-top-navigation & allow-popups → blocks redirects
// and pop-unders but keeps play/pause/seek/fullscreen working inside the iframe.
const SANDBOX_BLOCKED = "allow-same-origin allow-scripts allow-forms allow-presentation";
const SANDBOX_FULL = "allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation";

const MoviePlayer = ({ tmdbId, type = "movie", season = 1, episode = 1, serverId, onServerChange }: Props) => {
  const initialIdx = Math.max(0, PLAYER_SERVERS.findIndex((s) => s.id === serverId));
  const [serverIdx, setServerIdx] = useState(initialIdx === -1 ? 0 : initialIdx);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [adBlock, setAdBlock] = useState(true);
  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!serverId) return;
    const i = PLAYER_SERVERS.findIndex((s) => s.id === serverId);
    if (i >= 0 && i !== serverIdx) setServerIdx(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  const server = PLAYER_SERVERS[serverIdx];
  const builtSrc = server.build(tmdbId, type, season, episode);

  // Resolve from cache first, then fall back to template URL.
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

  return (
    <div className="w-full" style={{ background: "#0A0A0A" }}>
      <div ref={containerRef} className="relative w-full aspect-video overflow-hidden">
        {resolvedSrc && (
          <iframe
            key={`${resolvedSrc}-${adBlock ? "b" : "f"}`}
            src={resolvedSrc}
            className="absolute inset-0 w-full h-full"
            onLoad={handleLoad}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
            sandbox={adBlock ? SANDBOX_BLOCKED : SANDBOX_FULL}
            referrerPolicy="origin"
            title="BingBloom Player"
            style={{ border: 0, aspectRatio: "16/9" }}
          />
        )}

        {loading && !error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none" style={{ background: "#0A0A0A" }}>
            <Loader2 className="w-9 h-9 animate-spin mb-2" style={{ color: "#E50914" }} />
            <p className="text-white text-xs font-medium">Loading {server.label}…</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 px-6 text-center" style={{ background: "#0A0A0A" }}>
            <AlertCircle className="w-8 h-8" style={{ color: "#E50914" }} />
            <p className="text-white text-xs font-medium">Couldn't load {server.label}.</p>
            <button
              onClick={() => selectServer(serverIdx + 1)}
              className="flex items-center gap-1.5 text-white text-[11px] px-3 py-1.5 rounded-md font-semibold"
              style={{ background: "#E50914" }}
            >
              <RefreshCw className="w-3 h-3" /> Try next server
            </button>
          </div>
        )}

        <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setAdBlock((s) => !s)}
            title={adBlock ? "Ad-block on — redirects blocked" : "Ad-block off"}
            className="flex items-center gap-1 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-md"
            style={{ background: adBlock ? "#E50914" : "rgba(0,0,0,0.55)" }}
          >
            <Shield className="w-3 h-3" /> {adBlock ? "ON" : "OFF"}
          </button>
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
    </div>
  );
};

export default MoviePlayer;
