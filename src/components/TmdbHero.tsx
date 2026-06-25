import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Info, Star } from "lucide-react";
import { TmdbItem, img } from "@/lib/tmdb";
import { useTrendingMovies } from "@/hooks/useTmdb";

interface TmdbHeroProps {
  item?: TmdbItem;
  type?: "movie" | "tv";
  isLoading?: boolean;
}

const SLIDE_DURATION = 12000; // ms each slide stays
const BUTTON_DELAY = 1800; // ms wait before showing buttons
const FADE_OUT = 1400; // ms fade out before next

const TmdbHero = ({ isLoading }: TmdbHeroProps) => {
  const { data } = useTrendingMovies();
  const slides = (data || []).slice(0, 5);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "buttons" | "out">("in");

  useEffect(() => {
    if (slides.length === 0) return;
    setPhase("in");
    const t1 = setTimeout(() => setPhase("buttons"), BUTTON_DELAY);
    const t2 = setTimeout(() => setPhase("out"), SLIDE_DURATION - FADE_OUT);
    const t3 = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_DURATION);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [index, slides.length]);

  if (isLoading || slides.length === 0) {
    return <div className="relative w-full h-[42vh] sm:h-[55vh] md:h-[72vh] bg-gradient-to-br from-card to-background animate-pulse" />;
  }

  const item = slides[index];
  const backdrop = img(item.backdrop_path, "original") || img(item.poster_path, "original");
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const fadeImg = phase === "out" ? "opacity-0" : "opacity-100";
  const showButtons = phase === "buttons";

  return (
    <div className="relative w-full h-[42vh] sm:h-[55vh] md:h-[72vh] overflow-hidden">
      <img
        key={item.id}
        src={backdrop}
        alt={item.title}
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        style={{ transitionDuration: phase === "out" ? `${FADE_OUT}ms` : "1800ms" }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity ease-out scale-105 ${fadeImg}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

      <div className={`absolute bottom-8 md:bottom-20 left-0 right-0 px-[5%] max-w-3xl transition-opacity duration-500 ${phase === "out" ? "opacity-0" : "opacity-100"}`}>
        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-primary">
          #{index + 1} Spotlight
        </span>
        <h1 key={`t-${item.id}`} className="mt-1.5 text-2xl md:text-5xl font-extrabold text-foreground leading-tight drop-shadow-2xl animate-fade-in">
          {item.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] md:text-sm text-foreground/90">
          {item.vote_average > 0 && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-surface-2 px-2 py-0.5 font-semibold">
              <Star className="w-3 h-3 text-primary fill-primary" /> {item.vote_average.toFixed(1)}
            </span>
          )}
          <span className="inline-flex items-center rounded-sm bg-surface-2 px-2 py-0.5">Movie</span>
          {year && <span className="inline-flex items-center rounded-sm bg-surface-2 px-2 py-0.5">{year}</span>}
          <span className="inline-flex items-center rounded-sm bg-surface-2 px-2 py-0.5">HD</span>
        </div>
        <p className="hidden md:block mt-3 text-sm md:text-base text-foreground/80 line-clamp-3 max-w-xl">{item.overview}</p>

        <div
          className={`mt-3 md:mt-5 flex gap-2 md:gap-3 transition-all duration-500 ${
            showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          <Link
            to={`/watch/movie/${item.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Watch
          </Link>
          <Link
            to={`/movie/${item.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-foreground transition hover:bg-surface"
          >
            <Info className="w-3.5 h-3.5" /> Info
          </Link>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TmdbHero;
