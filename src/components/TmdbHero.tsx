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
    return <div className="relative h-[390px] w-full bg-card animate-pulse sm:h-[460px] md:h-[82vh] md:min-h-[650px]" />;
  }

  const item = slides[index];
  const backdrop = img(item.backdrop_path, "original") || img(item.poster_path, "original");
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const fadeImg = phase === "out" ? "opacity-0" : "opacity-100";
  const showButtons = phase === "buttons";

  return (
    <div className="relative h-[390px] w-full overflow-hidden sm:h-[460px] md:h-[82vh] md:min-h-[650px]">
      <img
        key={item.id}
        src={backdrop}
        alt={item.title}
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        style={{ transitionDuration: phase === "out" ? `${FADE_OUT}ms` : "1800ms" }}
         className={`absolute inset-0 w-full h-full object-cover grayscale-[25%] transition-opacity ease-out scale-105 ${fadeImg}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

      <div className={`absolute bottom-9 md:bottom-24 left-0 right-0 px-[5%] max-w-4xl transition-opacity duration-500 ${phase === "out" ? "opacity-0" : "opacity-100"}`}>
        <span className="inline-flex border border-border bg-card/60 px-2 py-0.5 text-[7px] md:px-3 md:py-1 md:text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground backdrop-blur-xl">
          Featured premiere · #{index + 1}
        </span>
        <h1 key={`t-${item.id}`} className="mt-2 font-display text-3xl sm:text-4xl md:mt-4 md:text-8xl text-foreground leading-[0.95] drop-shadow-2xl animate-fade-in">
          {item.title}
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[8px] md:mt-2 md:gap-1.5 md:text-sm text-foreground/90">
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
            className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-foreground px-4 text-[10px] font-bold text-background transition hover:opacity-90 active:scale-[0.98] md:h-auto md:gap-2 md:px-9 md:py-3 md:text-sm"
          >
            <Play className="w-4 h-4 fill-current" /> Watch now
          </Link>
          <Link
            to={`/movie/${item.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-card/70 px-4 text-[10px] font-semibold text-foreground backdrop-blur-md transition hover:bg-secondary md:h-auto md:gap-2 md:px-9 md:py-3 md:text-sm"
          >
            <Info className="w-4 h-4" /> More info
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
