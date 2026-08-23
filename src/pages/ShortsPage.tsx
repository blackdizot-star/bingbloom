import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Share2, Info, Play, Loader2, VolumeX, Volume2 } from "lucide-react";
import SEO from "@/components/SEO";
import { fetchTrendingTrailers, img } from "@/lib/tmdb";
import { toast } from "@/components/ui/sonner";

/**
 * TikTok-style vertical feed of movie/TV trailers. Each slide is a full-screen
 * YouTube embed that auto-plays when it enters the viewport.
 */
const ShortsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["tmdb", "shorts", "trailers"],
    queryFn: () => fetchTrendingTrailers(15),
    staleTime: 1000 * 60 * 30,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setActiveIdx(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [data]);

  const handleShare = async (title: string) => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast("Link copied!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-0">
      <SEO title="Shorts – Trailers feed – MovieNoir" description="Swipe through trending movie and TV trailers." />
      <Link to="/home" className="absolute top-3 left-3 z-50 p-2 rounded-full bg-black/60 backdrop-blur">
        <ArrowLeft className="w-5 h-5 text-white" />
      </Link>
      <button
        onClick={() => setMuted(m => !m)}
        className="absolute top-3 right-3 z-50 p-2 rounded-full bg-black/60 backdrop-blur"
        aria-label="Toggle sound"
      >
        {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
      </button>

      {isLoading && (
        <div className="h-full grid place-items-center text-white">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
      )}

      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {(data || []).map((t, idx) => {
          const isActive = idx === activeIdx;
          const isNear = Math.abs(idx - activeIdx) <= 1;
          const title = t.item.title || "Trailer";
          const isTv = t.item.media_type === "tv";
          const detailPath = `/${isTv ? "tv" : "movie"}/${t.item.id}`;
          return (
            <section
              key={`${t.item.id}-${t.key}`}
              className="relative h-[100dvh] w-full snap-start snap-always flex items-center justify-center bg-black"
            >
              {isNear ? (
                <iframe
                  key={`${t.key}-${isActive ? 'p' : 'q'}-${muted ? 'm' : 'u'}`}
                  src={`https://www.youtube.com/embed/${t.key}?autoplay=${isActive ? 1 : 0}&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&playsinline=1&rel=0&loop=1&playlist=${t.key}`}
                  title={title}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={img(t.item.backdrop_path, "w780") || img(t.item.poster_path, "w500") || ""}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              )}

              {/* Bottom gradient + info */}
              <div className="absolute inset-x-0 bottom-0 pt-20 pb-24 px-4 bg-gradient-to-t from-black via-black/70 to-transparent z-10 pointer-events-none">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#FF2D8F] mb-1">
                  {isTv ? "TV Series" : "Movie"} · Official Trailer
                </p>
                <h2 className="text-xl font-bold text-white leading-tight mb-1.5">{title}</h2>
                {t.item.overview && (
                  <p className="text-xs text-white/80 line-clamp-2 max-w-[80%]">{t.item.overview}</p>
                )}
              </div>

              {/* Right rail actions */}
              <div className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-5">
                <button
                  onClick={() => toast("Liked! ❤️")}
                  className="flex flex-col items-center gap-1 text-white"
                >
                  <span className="w-11 h-11 rounded-full bg-white/10 backdrop-blur grid place-items-center">
                    <Heart className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-semibold">Like</span>
                </button>
                <button
                  onClick={() => handleShare(title)}
                  className="flex flex-col items-center gap-1 text-white"
                >
                  <span className="w-11 h-11 rounded-full bg-white/10 backdrop-blur grid place-items-center">
                    <Share2 className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-semibold">Share</span>
                </button>
                <Link
                  to={detailPath}
                  className="flex flex-col items-center gap-1 text-white"
                >
                  <span className="w-11 h-11 rounded-full bg-white/10 backdrop-blur grid place-items-center">
                    <Info className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-semibold">Info</span>
                </Link>
                <Link
                  to={isTv ? `/watch/tv/${t.item.id}/1/1` : `/watch/movie/${t.item.id}`}
                  className="flex flex-col items-center gap-1 text-white"
                >
                  <span className="w-11 h-11 rounded-full bg-[#FF2D8F] grid place-items-center shadow-[0_0_20px_rgba(255,45,143,0.6)]">
                    <Play className="w-5 h-5 fill-white" />
                  </span>
                  <span className="text-[10px] font-semibold">Watch</span>
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default ShortsPage;