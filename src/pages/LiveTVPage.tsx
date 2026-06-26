import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Radio, Loader2, Tv, Search, Star, ChevronLeft, Maximize2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { fetchIptvChannels, type IptvChannel } from "@/lib/iptv";
import ProgrammeLineup from "@/components/ProgrammeLineup";

// ---- HLS player for IPTV-org streams ----
const HlsPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string>("");

  const proxyUrl = useMemo(() => {
    const ref = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    return `https://${ref}.supabase.co/functions/v1/proxy?any=1&url=${encodeURIComponent(src)}`;
  }, [src]);

  useEffect(() => {
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
  }, [proxyUrl]);

  const enterFullscreen = () => {
    const v = videoRef.current as any;
    if (!v) return;
    const req = v.requestFullscreen || v.webkitEnterFullscreen || v.webkitRequestFullscreen;
    req?.call(v);
    // Lock orientation when possible (Android/Chromium)
    const orientation: any = (screen as any).orientation;
    orientation?.lock?.("landscape").catch(() => {});
  };

  return (
    <div className="relative w-full aspect-video bg-black">
      <video
        ref={videoRef}
        controls
        playsInline
        onDoubleClick={enterFullscreen}
        className="w-full h-full"
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-destructive-foreground text-sm px-4 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

interface NumberedChannel extends IptvChannel {
  number: number;
}

const FAV_KEY = "livetv:favorites";

const PAGE_SIZE = 18; // list rows per page

const LiveTVPage = () => {
  const [activeChannel, setActiveChannel] = useState<NumberedChannel | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [page, setPage] = useState(1);
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

  useEffect(() => {
    setPage(1);
  }, [activeCategory, search]);

  const toggleFav = (url: string) => {
    setFavorites((f) => (f.includes(url) ? f.filter((u) => u !== url) : [url, ...f]));
  };

  const iptv = useQuery({
    queryKey: ["iptv", "verified-streams", "v2"],
    queryFn: fetchIptvChannels,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  const { numbered, byCategory, categories } = useMemo(() => {
    const list = iptv.data ?? [];
    const numbered: NumberedChannel[] = list.map((c, i) => ({
      ...c,
      number: i + 1,
    }));
    const byCategory = new Map<string, NumberedChannel[]>();
    for (const c of numbered) {
      const k = c.group || "Other";
      const arr = byCategory.get(k) ?? [];
      arr.push(c);
      byCategory.set(k, arr);
    }
    const favs = numbered.filter((c) => favorites.includes(c.url));
    const categories = ["All", ...(favs.length ? ["★ Favorites"] : []), ...Array.from(byCategory.keys()).sort()];
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

  // ===== PLAYER VIEW =====
  if (activeChannel) {
    return (
      <AppLayout>
        <SEO title={`${activeChannel.name} – Live TV – BingBloom`} description={`Watch ${activeChannel.name} live now on BingBloom.`} />
        <div className="min-h-[calc(100vh-3.5rem)]" style={{ background: "#0A0A0A" }}>
          {/* Header */}
          <div className="sticky top-12 md:top-14 z-30 flex items-center gap-2 px-3 py-2.5 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/5">
            <button
              onClick={() => setActiveChannel(null)}
              className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/5 text-white"
              aria-label="Back to channels"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse text-white" style={{ background: "#E50914" }}>
              Live
            </span>
            <span className="text-sm font-bold text-white truncate flex-1">{activeChannel.name}</span>
            <button
              onClick={() => toggleFav(activeChannel.url)}
              className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/5"
              aria-label="Favorite"
            >
              <Star className={`w-4 h-4 ${favorites.includes(activeChannel.url) ? "fill-yellow-400 text-yellow-400" : "text-white/60"}`} />
            </button>
          </div>

          {/* Player */}
          <HlsPlayer src={activeChannel.url} />

          {/* Channel meta */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5">
            <div className="w-12 h-12 rounded-lg bg-[#1F1F1F] grid place-items-center overflow-hidden flex-shrink-0">
              {activeChannel.logo ? (
                <img src={activeChannel.logo} alt={activeChannel.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <Tv className="w-5 h-5 text-white/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{activeChannel.name}</p>
              <p className="text-[10px] text-white/50 truncate">
                {activeChannel.country ? `${activeChannel.country} · ` : ""}{activeChannel.group || "Live channel"} · #{activeChannel.number}
              </p>
            </div>
          </div>

          {/* Programme Lineup */}
          <ProgrammeLineup channelName={activeChannel.name} group={activeChannel.group} />
        </div>
      </AppLayout>
    );
  }

  // ===== LIST/GRID VIEW =====
  return (
    <AppLayout>
      <SEO
        title="Live TV – BingBloom"
        description="Watch 80+ live TV channels from around the world — news, sports, entertainment, music and more, streamed free on BingBloom."
      />
      <div className="px-4 pt-4 pb-10 max-w-[1400px] mx-auto" style={{ background: "#0A0A0A" }}>
        {/* Title */}
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4" style={{ color: "#E50914" }} />
          <h1 className="text-lg font-bold text-white">Live TV</h1>
          <span className="ml-1 text-[10px] text-white/45">{numbered.length} channels</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
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
          <div className="overflow-x-auto whitespace-nowrap scrollbar-hide -mx-4 px-4 mb-4">
            <div className="inline-flex gap-2">
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                      active ? "text-white" : "text-white/70 hover:text-white"
                    }`}
                    style={{
                      background: active ? "#E50914" : "#1F1F1F",
                      border: active ? "1px solid #E50914" : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    {cat}
                    <span className="ml-1 opacity-60">({byCategory.get(cat)?.length ?? 0})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {iptv.isLoading && (
          <div className="grid grid-cols-3 gap-2.5">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden animate-pulse"
                style={{ background: "#1F1F1F", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="aspect-video bg-gradient-to-br from-white/[0.04] to-white/[0.10] relative">
                  <span className="absolute top-1 left-1 px-1 py-[1px] rounded text-[7px] font-bold uppercase text-white animate-pulse" style={{ background: "#E50914" }}>Live</span>
                </div>
                <div className="px-2 py-1.5 space-y-1">
                  <div className="h-2.5 rounded bg-white/10 w-3/4" />
                  <div className="h-2 rounded bg-white/5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
        {iptv.isError && (
          <p className="text-sm text-center py-10" style={{ color: "#E50914" }}>
            Failed to load channels. Please try again.
          </p>
        )}

        {/* 3-column channel grid */}
        {!iptv.isLoading && (() => {
          const totalPages = Math.max(1, Math.ceil(visibleChannels.length / PAGE_SIZE));
          const safePage = Math.min(page, totalPages);
          const start = (safePage - 1) * PAGE_SIZE;
          const pageChannels = visibleChannels.slice(start, start + PAGE_SIZE);
          const maxButtons = 5;
          let firstBtn = Math.max(1, safePage - 2);
          let lastBtn = Math.min(totalPages, firstBtn + maxButtons - 1);
          firstBtn = Math.max(1, lastBtn - maxButtons + 1);
          const pages: number[] = [];
          for (let p = firstBtn; p <= lastBtn; p++) pages.push(p);
          return (
            <>
              <div className="grid grid-cols-3 gap-2.5">
                {pageChannels.map((c) => {
                  const isFav = favorites.includes(c.url);
                  return (
                    <button
                      key={`${c.url}-${c.number}`}
                      onClick={() => setActiveChannel(c)}
                      className="group relative rounded-xl overflow-hidden text-left transition-transform hover:-translate-y-0.5"
                      style={{ background: "#1F1F1F", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="aspect-video grid place-items-center p-3 bg-black/30 relative">
                        {c.logo ? (
                          <img src={c.logo} alt={c.name} loading="lazy" className="max-w-full max-h-full object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        ) : (
                          <Tv className="w-6 h-6 text-white/40" />
                        )}
                        <span className="absolute top-1 left-1 px-1 py-[1px] rounded text-[7px] font-bold uppercase tracking-wider text-white animate-pulse" style={{ background: "#E50914" }}>Live</span>
                        {isFav && <Star className="absolute top-1 right-1 w-3 h-3 fill-yellow-400 text-yellow-400" />}
                      </div>
                      <div className="px-2 py-1.5">
                        <p className="text-[10.5px] font-bold text-white truncate leading-tight">{c.name}</p>
                        <p className="text-[9px] text-white/45 truncate mt-0.5">{c.group || "Live"}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {visibleChannels.length === 0 && (
                <p className="text-center text-xs text-white/50 py-10">No channels match.</p>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-30"
                    style={{ background: "#1F1F1F", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    « Prev
                  </button>
                  {pages.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-9 h-9 rounded-lg text-[12px] font-bold text-white"
                      style={{
                        background: p === safePage ? "#E50914" : "#1F1F1F",
                        border: p === safePage ? "1px solid #E50914" : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: p === safePage ? "0 0 12px rgba(229,9,20,0.5)" : "none",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-30"
                    style={{ background: "#1F1F1F", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    Next »
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </AppLayout>
  );
};

export default LiveTVPage;
