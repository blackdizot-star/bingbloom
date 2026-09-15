import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Radio, Play } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import MoviePlayer from "@/components/MoviePlayer";
import { usePopularMovies } from "@/hooks/useTmdb";
import { img } from "@/lib/tmdb";
import logo from "@/assets/bingbloom-logo.jpeg";

/**
 * Bing TV — a virtual 24/7 movie channel. Deterministically selects
 * a "currently airing" movie based on wall-clock time so all viewers
 * see (roughly) the same programme at the same time.
 */
const SLOT_MINUTES = 120; // each film slot ~2h

const BingTvChannel = () => {
  const { data: movies = [], isLoading } = usePopularMovies();

  const { current, schedule } = useMemo(() => {
    if (!movies.length) return { current: null as any, schedule: [] as any[] };
    const slotIdx = Math.floor(Date.now() / (SLOT_MINUTES * 60 * 1000)) % movies.length;
    const now = new Date();
    const slotStart = new Date(Math.floor(Date.now() / (SLOT_MINUTES * 60 * 1000)) * SLOT_MINUTES * 60 * 1000);
    const schedule = Array.from({ length: 6 }).map((_, i) => {
      const m = movies[(slotIdx + i) % movies.length];
      const start = new Date(slotStart.getTime() + i * SLOT_MINUTES * 60 * 1000);
      const end = new Date(start.getTime() + SLOT_MINUTES * 60 * 1000);
      return { movie: m, start, end, live: i === 0 };
    });
    return { current: movies[slotIdx], schedule };
  }, [movies]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <AppLayout>
      <SEO
        title="Bing TV – 24/7 Free Movie Channel – MovieNoir"
        description="Bing TV is MovieNoir's always-on movie channel — free, live, no sign-up. Tune in for popular films playing right now."
        canonicalPath="/live/bing-tv"
      />
      <div className="min-h-[calc(100vh-3.5rem)]" style={{ background: "#0A0A0A" }}>
        <div className="sticky top-12 md:top-14 z-30 flex items-center gap-2 px-3 py-2.5 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/5">
          <Link to="/live-tv" className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/5 text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse text-white" style={{ background: "#FF2D8F" }}>Live</span>
          <img src={logo} alt="Bing TV" className="w-6 h-6 rounded" />
          <span className="text-sm font-bold text-white truncate flex-1">Bing TV</span>
        </div>

        <div className="w-full md:max-w-3xl md:mx-auto">
          {current ? (
            <MoviePlayer
              key={current.id}
              tmdbId={String(current.id)}
              type="movie"
              serverId="vidbolt"
              onServerChange={() => {}}
              title={current.title}
              year={(current.release_date || "").slice(0, 4)}
              poster={current.poster_path ? img(current.poster_path, "w500") : null}
              backdrop={current.backdrop_path ? img(current.backdrop_path, "w780") : null}
            />
          ) : (
            <div className="aspect-video bg-black grid place-items-center text-white/60 text-sm">
              {isLoading ? "Loading Bing TV…" : "Bing TV is warming up."}
            </div>
          )}
        </div>

        <div className="px-4 py-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4" style={{ color: "#FF2D8F" }} />
            <h2 className="text-sm font-bold text-white">Programme guide</h2>
            <span className="text-[10px] text-white/45">updates hourly</span>
          </div>
          <div className="space-y-2">
            {schedule.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background: s.live ? "#1a0f10" : "#141414", border: `1px solid ${s.live ? "#FF2D8F" : "rgba(255,255,255,0.06)"}` }}
              >
                <div className="w-16 aspect-video rounded overflow-hidden bg-black flex-shrink-0">
                  {s.movie.backdrop_path && (
                    <img src={img(s.movie.backdrop_path, "w300") || ""} alt={s.movie.title} loading="lazy" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {s.live && <span className="px-1 py-[1px] rounded text-[8px] font-bold uppercase text-white animate-pulse" style={{ background: "#FF2D8F" }}>Now</span>}
                    <p className="text-[12.5px] font-bold text-white truncate">{s.movie.title}</p>
                  </div>
                  <p className="text-[10.5px] text-white/50 mt-0.5">
                    {fmt(s.start)} – {fmt(s.end)}
                  </p>
                </div>
                {!s.live && (
                  <Link to={`/watch/movie/${s.movie.id}`} className="grid place-items-center w-8 h-8 rounded-full bg-white/5 text-white">
                    <Play className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BingTvChannel;
