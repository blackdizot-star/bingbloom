import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Radio, Tv, Search, Star, ChevronLeft, Globe2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { fetchIptvChannels, type IptvChannel } from "@/lib/iptv";
import ProgrammeLineup from "@/components/ProgrammeLineup";

// ---- Unified player: HLS for IPTV, iframe embed for YouTube live ----
const LiveChannelPlayer = ({ channel }: { channel: IptvChannel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string>("");
  const isYouTube = channel.kind === "youtube";

  const proxyUrl = useMemo(() => {
    if (isYouTube) return "";
    const ref = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    return `https://${ref}.supabase.co/functions/v1/proxy?any=1&url=${encodeURIComponent(channel.url)}`;
  }, [channel.url, isYouTube]);

  useEffect(() => {
    if (isYouTube) return;
    const v = videoRef.current;
    if (!v || !proxyUrl) return;
    setError("");
    hlsRef.current?.destroy();

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(proxyUrl);
      hls.attachMedia(v);
      hls.on(Hls.Events.MANIFEST_PARSED, () => v.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setError("Stream is offline or unreachable.");
      });
    } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = proxyUrl;
      v.play().catch(() => {});
    } else {
      setError("HLS not supported in this browser.");
    }
    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [proxyUrl, isYouTube]);

  const enterFullscreen = async () => {
    const v = videoRef.current as any;
    if (!v) return;
    try {
      const req = v.requestFullscreen || v.webkitEnterFullscreen || v.webkitRequestFullscreen;
      await req?.call(v);
      try {
        await (screen as any).orientation?.lock?.("landscape");
      } catch {
        /* ignore */
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      {/* Channel logo overlay */}
      {channel.logo && (
        <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur rounded-md p-1.5 border border-white/10">
          <img src={channel.logo} alt="" className="h-6 max-w-[80px] object-contain" />
        </div>
      )}
      {isYouTube ? (
        <iframe
          key={channel.url}
          src={channel.embedUrl || channel.url}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          title={channel.name}
        />
      ) : (
        <video
          ref={videoRef}
          controls
          playsInline
          onDoubleClick={enterFullscreen}
          className="w-full h-full"
        />
      )}
      {error && !isYouTube && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-sm px-4 text-center">
          {error}
        </div>
      )}
    </div>
  );
};


// Full world-map visual with pulsing markers (tvgarden.world-style).
const WORLD_MARKERS = [
  { x: 20, y: 42, label: "US" }, { x: 25, y: 38, label: "CA" },
  { x: 32, y: 60, label: "BR" }, { x: 28, y: 65, label: "AR" },
  { x: 48, y: 38, label: "GB" }, { x: 51, y: 42, label: "DE" },
  { x: 50, y: 46, label: "IT" }, { x: 47, y: 44, label: "FR" },
  { x: 56, y: 48, label: "QA" }, { x: 52, y: 62, label: "NG" },
  { x: 55, y: 68, label: "ZA" }, { x: 55, y: 58, label: "KE" },
  { x: 68, y: 50, label: "IN" }, { x: 78, y: 44, label: "JP" },
  { x: 74, y: 46, label: "CN" }, { x: 85, y: 68, label: "AU" },
];

const GlobeVisual = () => (
  <div
    className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10"
    style={{ background: "linear-gradient(180deg,#050b18 0%,#020509 100%)" }}
  >
    <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <defs>
        <radialGradient id="glowMap" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#0b2545" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#020509" stopOpacity="0" />
        </radialGradient>
        <pattern id="dots" width="1" height="1" patternUnits="userSpaceOnUse">
          <circle cx="0.5" cy="0.5" r="0.18" fill="#1e3a5f" opacity="0.55" />
        </pattern>
      </defs>
      <rect width="100" height="60" fill="url(#glowMap)" />
      {/* Simplified continents as dot-cloud silhouettes */}
      <g fill="#1e4d7b" opacity="0.85">
        {/* N America */}
        <path d="M12 20 Q18 14 26 16 L30 22 L28 30 L22 38 L14 34 Z" />
        {/* S America */}
        <path d="M26 40 L32 42 L34 52 L30 58 L26 56 Z" />
        {/* Europe */}
        <path d="M46 20 L54 18 L56 26 L52 30 L46 28 Z" />
        {/* Africa */}
        <path d="M48 32 L58 32 L60 46 L54 56 L50 52 Z" />
        {/* Asia */}
        <path d="M56 16 L82 14 L88 24 L82 34 L70 34 L62 30 L56 24 Z" />
        {/* India */}
        <path d="M66 32 L72 34 L70 42 L66 42 Z" />
        {/* SE Asia / Indo */}
        <path d="M76 38 L86 40 L84 46 L78 44 Z" />
        {/* Australia */}
        <path d="M82 48 L92 48 L92 56 L84 56 Z" />
      </g>
      <rect width="100" height="60" fill="url(#dots)" opacity="0.15" />
      {WORLD_MARKERS.map((m, i) => (
        <g key={i}>
          <circle cx={m.x} cy={m.y} r="0.9" fill="#E50914">
            <animate attributeName="r" values="0.6;1.6;0.6" dur="2.4s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.2;1" dur="2.4s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={m.x} cy={m.y} r="0.4" fill="#fff" opacity="0.9" />
        </g>
      ))}
    </svg>
    <div className="absolute bottom-3 left-0 right-0 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur border border-white/10">
        <Globe2 className="w-3.5 h-3.5 text-cyan-300" />
        <span className="text-[11px] text-white/80 font-semibold">Pick a channel to start streaming worldwide</span>
      </div>
    </div>
  </div>
);


interface NumberedChannel extends IptvChannel {
  number: number;
}

const FAV_KEY = "livetv:favorites";

const LiveTVPage = () => {
  const [activeChannel, setActiveChannel] = useState<NumberedChannel | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFav = (url: string) => {
    setFavorites((f) => (f.includes(url) ? f.filter((u) => u !== url) : [url, ...f]));
  };

  const iptv = useQuery({
    queryKey: ["iptv", "verified-streams", "v3"],
    queryFn: fetchIptvChannels,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  const { numbered, byCategory, categories } = useMemo(() => {
    const list = iptv.data ?? [];
    const numbered: NumberedChannel[] = list.map((c, i) => ({ ...c, number: i + 1 }));
    const byCategory = new Map<string, NumberedChannel[]>();
    for (const c of numbered) {
      const k = c.group || "Other";
      byCategory.set(k, [...(byCategory.get(k) ?? []), c]);
    }
    const favs = numbered.filter((c) => favorites.includes(c.url));
    const categories = [
      "All",
      ...(favs.length ? ["★ Favorites"] : []),
      ...Array.from(byCategory.keys()).sort(),
    ];
    if (favs.length) byCategory.set("★ Favorites", favs);
    byCategory.set("All", numbered);
    return { numbered, byCategory, categories };
  }, [iptv.data, favorites]);

  const visibleChannels = useMemo(() => {
    const base = byCategory.get(activeCategory) ?? numbered;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    if (/^\d+$/.test(q)) return base.filter((c) => c.number === Number(q));
    return base.filter((c) => c.name.toLowerCase().includes(q));
  }, [activeCategory, byCategory, numbered, search]);

  return (
    <AppLayout>
      <SEO
        title={activeChannel ? `${activeChannel.name} – Live TV – BingBloom` : "Live TV – BingBloom"}
        description="Watch global live TV channels — news, sports, entertainment and more — free on BingBloom."
      />
      <div className="min-h-[calc(100vh-3.5rem)]" style={{ background: "#0A0A0A" }}>
        <div className="max-w-[1400px] mx-auto w-full px-3 md:px-4 pt-3 pb-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            {activeChannel && (
              <button
                onClick={() => setActiveChannel(null)}
                className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/5 text-white"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <Radio className="w-4 h-4" style={{ color: "#E50914" }} />
            <h1 className="text-lg font-bold text-white">Live TV</h1>
            <span className="ml-1 text-[10px] text-white/45">{numbered.length} channels</span>
          </div>

          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-5">
            {/* Left: Player or Globe */}
            <div className="min-w-0">
              {activeChannel ? (
                <>
                  <div className="flex items-center gap-2 px-1 py-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse text-white"
                      style={{ background: "#E50914" }}
                    >
                      Live
                    </span>
                    <span className="text-sm font-bold text-white truncate flex-1">
                      {activeChannel.name}
                    </span>
                    <button
                      onClick={() => toggleFav(activeChannel.url)}
                      className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/5"
                      aria-label="Favorite"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favorites.includes(activeChannel.url)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/60"
                        }`}
                      />
                    </button>
                  </div>
                  <LiveChannelPlayer channel={activeChannel} />
                  <div className="px-1 py-3 flex items-center gap-3 border-b border-white/5">
                    <div className="w-12 h-12 rounded-lg bg-[#1F1F1F] grid place-items-center overflow-hidden flex-shrink-0">
                      {activeChannel.logo ? (
                        <img
                          src={activeChannel.logo}
                          alt={activeChannel.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Tv className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{activeChannel.name}</p>
                      <p className="text-[10px] text-white/50 truncate">
                        {activeChannel.country ? `${activeChannel.country} · ` : ""}
                        {activeChannel.group || "Live channel"} · #{activeChannel.number}
                      </p>
                    </div>
                  </div>
                  <ProgrammeLineup channelName={activeChannel.name} group={activeChannel.group} />
                </>
              ) : (
                <GlobeVisual />
              )}
            </div>

            {/* Right sidebar: search + categories + channels */}
            <aside className="mt-4 lg:mt-0">
              <div className="lg:sticky lg:top-14 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search channels…"
                    className="w-full pl-9 pr-3 py-2 rounded-lg text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#E50914]/60 border border-white/5"
                    style={{ background: "#1F1F1F" }}
                  />
                </div>

                {/* Category chips */}
                {!iptv.isLoading && categories.length > 0 && (
                  <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <div className="inline-flex gap-1.5">
                      {categories.map((cat) => {
                        const active = activeCategory === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold transition-all ${
                              active ? "text-white" : "text-white/70 hover:text-white"
                            }`}
                            style={{
                              background: active ? "#E50914" : "#1F1F1F",
                              border: active
                                ? "1px solid #E50914"
                                : "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            {cat}
                            <span className="ml-1 opacity-60">
                              ({byCategory.get(cat)?.length ?? 0})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Channel list */}
                <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
                  {iptv.isLoading &&
                    Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg animate-pulse"
                        style={{ background: "#1F1F1F" }}
                      >
                        <div className="w-10 h-10 rounded-md bg-white/5 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 rounded bg-white/10 w-2/3" />
                          <div className="h-2 rounded bg-white/5 w-1/3" />
                        </div>
                      </div>
                    ))}

                  {!iptv.isLoading &&
                    visibleChannels.map((c) => {
                      const isFav = favorites.includes(c.url);
                      const isActive = activeChannel?.url === c.url;
                      return (
                        <div
                          key={`${c.url}-${c.number}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => setActiveChannel(c)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActiveChannel(c);
                            }
                          }}
                          className={`group w-full flex items-center gap-2.5 p-2 rounded-lg text-left cursor-pointer transition ${
                            isActive
                              ? "bg-[#E50914]/15 border border-[#E50914]/40"
                              : "hover:bg-white/[0.05] border border-white/[0.06]"
                          }`}
                          style={{ background: isActive ? undefined : "#141414" }}
                        >
                          <div className="relative w-10 h-10 rounded-md overflow-hidden grid place-items-center bg-black/40 flex-shrink-0">
                            {c.logo ? (
                              <img
                                src={c.logo}
                                alt={c.name}
                                loading="lazy"
                                className="max-w-full max-h-full object-contain p-1"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <Tv className="w-4 h-4 text-white/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="px-1 py-[1px] rounded text-[8px] font-bold uppercase tracking-wider text-white animate-pulse"
                                style={{ background: "#E50914" }}
                              >
                                Live
                              </span>
                              <p className="text-[12px] font-bold text-white truncate">{c.name}</p>
                            </div>
                            <p className="text-[10px] text-white/50 truncate mt-0.5">
                              {c.group || "Live"}
                              {c.country ? ` · ${c.country}` : ""} · #{c.number}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFav(c.url);
                            }}
                            className="w-7 h-7 grid place-items-center rounded-full hover:bg-white/5 flex-shrink-0"
                            aria-label="Favorite"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                isFav ? "fill-yellow-400 text-yellow-400" : "text-white/35"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}

                  {!iptv.isLoading && visibleChannels.length === 0 && (
                    <p className="text-center text-xs text-white/50 py-8">No channels match.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LiveTVPage;
