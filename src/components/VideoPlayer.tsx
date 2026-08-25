import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Hls from "hls.js";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Info,
} from "lucide-react";
import { getSetting } from "@/hooks/useSettings";
import { useTvSeason, useTvDetail } from "@/hooks/useTmdb";
import { getDownloadBlobUrl } from "@/lib/offlineDownloads";

interface VideoPlayerProps {
  tmdbId: string;
  type?: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
  poster?: string;
  serverOverride?: Domain;
}

// vidsrc.pm is the FAST default; the rest are fallbacks.
const EMBED_DOMAINS = [
  "vidsrc.pm",
  "vidsrc.to",
  "vidsrc.xyz",
  "vidsrc.net",
  "vidsrc.in",
  "vidsrc.cc",
  "2embed.cc",
  "autoembed.co",
] as const;
type Domain = (typeof EMBED_DOMAINS)[number];

interface StreamResp {
  ok: boolean;
  kind?: "hls" | "embed";
  streamUrl?: string;
  source?: string;
  error?: string;
  diagnostics?: Record<string, unknown>;
}

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
};

const LOAD_TIMEOUT_MS = 9000;
const MAX_RETRIES = EMBED_DOMAINS.length;

const VideoPlayer = ({
  tmdbId,
  type = "movie",
  season,
  episode,
  title,
  poster,
  serverOverride,
}: VideoPlayerProps) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const loadTimer = useRef<ReturnType<typeof setTimeout>>();

  const [domain, setDomain] = useState<Domain>(serverOverride ?? "vidsrc.pm");
  const [forceEmbed, setForceEmbed] = useState(true); // embed is faster + always works
  const [retries, setRetries] = useState(0);

  // Sync external server override → internal domain state
  useEffect(() => {
    if (serverOverride && serverOverride !== domain) {
      setDomain(serverOverride);
      setRetries(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverOverride]);

  const [streamUrl, setStreamUrl] = useState("");
  const [streamKind, setStreamKind] = useState<"hls" | "embed" | "offline">("embed");
  const [source, setSource] = useState("");
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [showStart, setShowStart] = useState(true);
  const [showDiag, setShowDiag] = useState(false);
  const [showDomainMenu, setShowDomainMenu] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // TV: load season/episode list
  const tvDetail = useTvDetail(type === "tv" ? tmdbId : undefined);
  const seasonQuery = useTvSeason(type === "tv" ? tmdbId : undefined, season);
  const seasons = (tvDetail.data?.seasons || []).filter((s: any) => s.season_number > 0);
  const episodes = seasonQuery.data?.episodes || [];

  // Fetch stream URL: prefer offline blob, else go through edge function
  const fetchStream = useCallback(
    async (opts: { force?: boolean; domainOverride?: Domain } = {}) => {
      setStatus("loading");
      setErrorMsg("");
      setDiagnostics(null);
      // Offline-first: serve from IndexedDB if downloaded
      try {
        const offlineId =
          type === "tv"
            ? `tv-${tmdbId}-s${season ?? 1}-e${episode ?? 1}`
            : `movie-${tmdbId}`;
        const blobUrl = await getDownloadBlobUrl(offlineId);
        if (blobUrl) {
          setStreamUrl(blobUrl);
          setStreamKind("offline");
          setSource("Offline download");
          setStatus("ready");
          return;
        }
      } catch {
        // fall through to network
      }
      const useDomain = opts.domainOverride ?? domain;
      const useForce = opts.force ?? forceEmbed;
      try {
        const params: Record<string, string> = {
          tmdbId,
          type,
          domain: useDomain,
        };
        if (useForce) params.forceEmbed = "1";
        if (type === "tv") {
          params.season = String(season ?? 1);
          params.episode = String(episode ?? 1);
        }
        const qs = new URLSearchParams(params).toString();
        const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const url = `https://${projectRef}.supabase.co/functions/v1/vidsrc-stream?${qs}`;
        // Retry edge function up to 3x on 5xx (cold-start / transient runtime errors)
        let res: Response | null = null;
        let lastStatus = 0;
        for (let attempt = 0; attempt < 3; attempt++) {
          res = await fetch(url, {
            headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          });
          lastStatus = res.status;
          if (res.ok) break;
          // 5xx → backoff and retry; 4xx → break and surface the error
          if (res.status < 500) break;
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        }
        if (!res || !res.ok) {
          // Edge function unreachable → fall back to direct embed URL client-side
          const directDomain = useDomain;
          const directUrl =
            type === "tv"
              ? `https://${directDomain}/embed/tv/${tmdbId}/${season ?? 1}/${episode ?? 1}?autoplay=1`
              : `https://${directDomain}/embed/movie/${tmdbId}?autoplay=1`;
          setStreamUrl(directUrl);
          setStreamKind("embed");
          setSource(`${directDomain} (direct, edge ${lastStatus})`);
          setStatus("ready");
          return;
        }
        const data: StreamResp = await res.json().catch(() => ({ ok: false }));
        setDiagnostics(data.diagnostics ?? null);
        if (!data.ok || !data.streamUrl) {
          throw new Error(data.error || "Stream lookup failed");
        }
        setStreamUrl(data.streamUrl);
        setStreamKind(data.kind === "embed" ? "embed" : "hls");
        setSource(data.source || "");
        setStatus("ready");
      } catch (e) {
        console.error("[VideoPlayer] fetchStream", e);
        setErrorMsg(
          e instanceof Error ? e.message : "Stream unavailable. Please try again later.",
        );
        setStatus("error");
      }
    },
    [tmdbId, type, season, episode, domain, forceEmbed],
  );

  const escalateRetry = useCallback(() => {
    if (retries >= MAX_RETRIES) {
      setStatus("error");
      setErrorMsg("All retry attempts exhausted. Try a different server.");
      return;
    }
    const next = retries + 1;
    setRetries(next);
    const idx = EMBED_DOMAINS.indexOf(domain);
    const nextDomain = EMBED_DOMAINS[(idx + 1) % EMBED_DOMAINS.length];
    console.log("[VideoPlayer] retry → next domain", nextDomain);
    setDomain(nextDomain);
    fetchStream({ force: true, domainOverride: nextDomain });
  }, [retries, domain, fetchStream]);

  useEffect(() => {
    clearTimeout(loadTimer.current);
    if (status === "loading") {
      loadTimer.current = setTimeout(() => {
        if (status === "loading") {
          console.warn("[VideoPlayer] load timeout");
          escalateRetry();
        }
      }, LOAD_TIMEOUT_MS);
    }
    return () => clearTimeout(loadTimer.current);
  }, [status, escalateRetry]);

  // When season/episode change while playing, refetch immediately.
  useEffect(() => {
    if (showStart) return;
    setRetries(0);
    fetchStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, season, episode, type]);

  // Autoplay: if the user enabled autoplay in settings, skip the start screen.
  useEffect(() => {
    if (!showStart) return;
    if (!getSetting("autoplay")) return;
    setShowStart(false);
    setRetries(0);
    fetchStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, season, episode, type]);

  // HLS attach
  useEffect(() => {
    if (showStart || !streamUrl || streamKind !== "hls" || !videoRef.current) return;
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) escalateRetry();
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.play().catch(() => {});
    } else {
      escalateRetry();
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [streamUrl, streamKind, showStart, escalateRetry]);

  const bumpControls = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 2500);
  }, [playing]);

  const handleStart = () => {
    setShowStart(false);
    setRetries(0);
    if (status === "idle") fetchStream();
    // On mobile, request fullscreen + landscape after user gesture.
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    if (isMobile && containerRef.current) {
      const el = containerRef.current as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      const req = el.requestFullscreen?.bind(el) || el.webkitRequestFullscreen?.bind(el);
      Promise.resolve(req?.()).then(() => {
        const so = (screen as any).orientation;
        if (so?.lock) so.lock("landscape").catch(() => {});
      }).catch(() => {});
    }
  };

  const manualRetry = () => {
    setRetries(0);
    fetchStream();
  };

  const switchDomain = (d: Domain) => {
    setDomain(d);
    setShowDomainMenu(false);
    setRetries(0);
    if (!showStart) fetchStream({ domainOverride: d });
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
  }, []);

  const seekTo = (pct: number) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = (pct / 100) * v.duration;
  };

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  // Auto-advance to next episode (HLS only — iframe controls its own playback)
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);
  const goNextEpisode = useCallback(() => {
    if (type !== "tv" || !season || !episode) return null;
    const list = episodes;
    const hasNext = list.some((e: any) => e.episode_number === episode + 1);
    if (hasNext) return `/watch/tv/${tmdbId}/${season}/${episode + 1}`;
    const nextSeason = seasons.find((s: any) => s.season_number === season + 1);
    if (nextSeason) return `/watch/tv/${tmdbId}/${season + 1}/1`;
    return null;
  }, [type, season, episode, episodes, seasons, tmdbId]);

  const startNextCountdown = useCallback(() => {
    if (type !== "tv") return;
    if (!goNextEpisode()) return;
    setNextCountdown(5);
  }, [type, goNextEpisode]);

  useEffect(() => {
    if (nextCountdown === null) return;
    if (nextCountdown <= 0) {
      const next = goNextEpisode();
      setNextCountdown(null);
      if (next) navigate(next);
      return;
    }
    const id = setTimeout(() => setNextCountdown((n) => (n === null ? null : n - 1)), 1000);
    return () => clearTimeout(id);
  }, [nextCountdown, goNextEpisode, navigate]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => startNextCountdown();
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, [startNextCountdown, streamUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        seekBy(10);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        seekBy(-10);
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, seekBy, toggleFullscreen]);

  // NOTE: We do NOT install a `beforeunload` handler here — it caused the
  // browser's "Leave site?" prompt to appear on every navigation. The strict
  // iframe sandbox below already blocks top-level navigation from ad scripts.

  // Video event bindings
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrent(v.currentTime);
    const onMeta = () => setDuration(v.duration || 0);
    const onVol = () => {
      setVolume(v.volume);
      setMuted(v.muted);
    };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("volumechange", onVol);

    // Periodic Continue Watching save (every 5s)
    const progressInt = setInterval(() => {
      if (!v.duration || v.paused) return;
      try {
        const key = `bb:progress:${type}-${tmdbId}${type === "tv" ? `-s${season}-e${episode}` : ""}`;
        localStorage.setItem(
          key,
          JSON.stringify({
            currentTime: v.currentTime,
            duration: v.duration,
            updatedAt: Date.now(),
          }),
        );
      } catch {
        // quota or storage disabled — ignore
      }
    }, 5000);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("volumechange", onVol);
      clearInterval(progressInt);
    };
  }, [streamUrl, showStart, type, tmdbId, season, episode]);

  const progressPct = duration > 0 ? (current / duration) * 100 : 0;

  const handleEpisodeClick = (epNum: number) => {
    if (type !== "tv" || !season) return;
    navigate(`/watch/tv/${tmdbId}/${season}/${epNum}`);
  };

  const handleSeasonChange = (seasonNum: number) => {
    if (type !== "tv") return;
    navigate(`/watch/tv/${tmdbId}/${seasonNum}/1`);
  };

  return (
    <div className="w-full" style={{ background: "#0A0A0A" }}>
      {title && (
        <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
        </div>
      )}


      {/* Layout: stack on mobile, side-by-side on desktop (TV only) */}
      <div className="px-3 sm:px-4 pb-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-start">
          <div
            ref={containerRef}
            className={`relative aspect-video overflow-hidden rounded-xl group bg-black w-full ${
              type === "tv" ? "lg:flex-1 lg:min-w-0" : "max-w-3xl mx-auto"
            }`}
            onMouseMove={bumpControls}
            onTouchStart={bumpControls}
          >
            {/* Start screen */}
            {showStart && (
              <div
                className="absolute inset-0 z-30 flex items-center justify-center"
                style={{
                  background: poster
                    ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url(${poster}) center/cover no-repeat`
                    : "#0A0A0A",
                }}
              >
                <button
                  onClick={handleStart}
                  aria-label="Play"
                  className="flex items-center justify-center w-20 h-20 rounded-full text-white transition-transform hover:scale-110 shadow-2xl"
                  style={{ background: "#FF2D8F" }}
                >
                  <Play className="w-9 h-9 ml-1 fill-white" />
                </button>
              </div>
            )}

            {/* Native video for HLS */}
            {!showStart && streamKind === "hls" && status === "ready" && (
              <video
                ref={videoRef}
                className="w-full h-full absolute inset-0 bg-black"
                autoPlay
                playsInline
                crossOrigin="anonymous"
                onClick={togglePlay}
              />
            )}

            {/* Offline (downloaded MP4 from IndexedDB) */}
            {!showStart && streamKind === "offline" && status === "ready" && (
              <video
                ref={videoRef}
                src={streamUrl}
                className="w-full h-full absolute inset-0 bg-black"
                autoPlay
                playsInline
                controls
                onClick={togglePlay}
              />
            )}

            {/* Iframe fallback */}
            {!showStart && streamKind === "embed" && status === "ready" && (
              <iframe
                key={streamUrl}
                src={streamUrl}
                className="w-full h-full absolute inset-0"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                referrerPolicy="origin"
                title="Player"
                style={{ border: "none" }}
              />
            )}


            {/* Auto-play next episode overlay */}
            {nextCountdown !== null && (
              <div className="absolute bottom-4 right-4 z-30 bg-black/85 border border-white/10 rounded-xl px-4 py-3 text-white text-sm shadow-2xl flex items-center gap-3">
                <div>
                  <p className="font-semibold">Next video starting…</p>
                  <p className="text-[11px] text-white/60 mt-0.5">in {nextCountdown}s</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNextCountdown(null)}
                    className="text-[11px] px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setNextCountdown(0)}
                    className="text-[11px] px-3 py-1.5 rounded-md font-medium"
                    style={{ background: "#FF2D8F" }}
                  >
                    Play now
                  </button>
                </div>
              </div>
            )}

            {!showStart && status === "loading" && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center z-20"
                style={{ background: "rgba(10,10,10,0.85)" }}
              >
                <Loader2 className="w-10 h-10 animate-spin mb-3" style={{ color: "#FF2D8F" }} />
                <p className="text-white text-sm font-medium">Connecting to stream...</p>
                {retries > 0 && (
                  <p className="text-xs mt-1" style={{ color: "#A1A1A1" }}>
                    Retry {retries} of {MAX_RETRIES}
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {!showStart && status === "error" && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-3 px-6 text-center"
                style={{ background: "rgba(10,10,10,0.92)" }}
              >
                <AlertCircle className="w-10 h-10" style={{ color: "#FF2D8F" }} />
                <p className="text-white text-sm font-medium">
                  {errorMsg || "Stream unavailable. Please try again later."}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={manualRetry}
                    className="flex items-center gap-2 text-white text-sm px-4 py-2 rounded-lg font-medium"
                    style={{ background: "#FF2D8F" }}
                  >
                    <RefreshCw className="w-4 h-4" /> Retry
                  </button>
                  <button
                    onClick={() => setShowDiag(true)}
                    className="flex items-center gap-2 text-white text-xs px-3 py-2 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <Info className="w-3.5 h-3.5" /> Diagnostics
                  </button>
                </div>
              </div>
            )}

            {/* Diagnostics overlay */}
            {showDiag && (
              <div
                className="absolute inset-0 z-40 flex items-end justify-end p-4"
                onClick={() => setShowDiag(false)}
              >
                <div
                  className="max-w-sm w-full text-xs text-white rounded-lg p-3 shadow-2xl"
                  style={{
                    background: "rgba(0,0,0,0.92)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Stream diagnostics</span>
                    <button
                      onClick={() => setShowDiag(false)}
                      className="text-white/60 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <span className="text-white/60">Mode:</span> {streamKind.toUpperCase()}
                    </div>
                    <div>
                      <span className="text-white/60">Server:</span> {EMBED_DOMAINS.indexOf(domain) + 1}
                    </div>
                    <div>
                      <span className="text-white/60">Retries:</span> {retries}/{MAX_RETRIES}
                    </div>
                    {errorMsg && <div className="text-[#FF2D8F]">Error: {errorMsg}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* HLS controls */}
            {!showStart && status === "ready" && streamKind === "hls" && (
              <div
                className={`absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${
                  showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
                }}
              >
                <div className="px-4 pt-8 pb-2">
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                    onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      seekTo(((e.clientX - r.left) / r.width) * 100);
                    }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{ width: `${progressPct}%`, background: "#FF2D8F" }}
                    />
                  </div>
                </div>
                <div className="px-4 pb-3 flex items-center gap-3">
                  <button onClick={() => seekBy(-10)} className="text-white hover:text-[#FF2D8F]">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="flex items-center justify-center w-9 h-9 rounded-full text-white"
                    style={{ background: "#FF2D8F" }}
                  >
                    {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <button onClick={() => seekBy(10)} className="text-white hover:text-[#FF2D8F]">
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2 ml-1">
                    <button onClick={toggleMute} className="text-white hover:text-[#FF2D8F]">
                      {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={muted ? 0 : volume * 100}
                      onChange={(e) => {
                        const v = videoRef.current;
                        if (!v) return;
                        const val = Number(e.target.value) / 100;
                        v.volume = val;
                        if (val > 0) v.muted = false;
                      }}
                      className="w-20 accent-[#FF2D8F] hidden sm:block"
                    />
                  </div>
                  <span className="text-xs ml-2 text-white">
                    {fmt(current)} / {fmt(duration)}
                  </span>
                  <div className="flex-1" />
                  <button onClick={toggleFullscreen} className="text-white hover:text-[#FF2D8F] p-1.5">
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Episode panel removed — selection handled by TvWatchPage's horizontal episode row */}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
