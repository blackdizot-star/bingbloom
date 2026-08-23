import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { img } from "@/lib/tmdb";

interface ContinueItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  progress?: number; // 0..100
  season?: number;
  episode?: number;
  updatedAt: number;
}

const STORAGE_KEY = "bb-continue-watching";

export const recordContinue = (item: Omit<ContinueItem, "updatedAt">) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: ContinueItem[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(
      i => !(i.id === item.id && i.type === item.type && i.season === item.season && i.episode === item.episode),
    );
    filtered.unshift({ ...item, updatedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 24)));
  } catch {
    // ignore
  }
};

const seedIfEmpty = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && JSON.parse(raw).length > 0) return;
    const seed: ContinueItem[] = [
      { id: 157336, type: "movie", title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", progress: 35, updatedAt: Date.now() - 1000 * 60 * 60 },
      { id: 1399, type: "tv", title: "Game of Thrones", poster_path: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg", season: 1, episode: 3, progress: 60, updatedAt: Date.now() - 1000 * 60 * 60 * 5 },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // ignore
  }
};

const TmdbContinueRow = () => {
  const [items, setItems] = useState<ContinueItem[]>([]);

  useEffect(() => {
    seedIfEmpty();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mb-7">
      <h2 className="text-base font-semibold text-foreground px-[4%] mb-3">Continue Watching</h2>
      <div className="flex gap-3 px-[4%] overflow-x-auto scrollbar-hide pb-2">
        {items.map(it => {
          const watchTo =
            it.type === "tv"
              ? `/watch/tv/${it.id}/${it.season ?? 1}/${it.episode ?? 1}`
              : `/watch/movie/${it.id}`;
          const poster = img(it.poster_path, "w500") || "/placeholder.svg";
          return (
            <Link
              key={`${it.type}-${it.id}-${it.season}-${it.episode}`}
              to={watchTo}
              className="group flex-shrink-0 w-[180px]"
            >
              <div className="aspect-video rounded-lg overflow-hidden relative bg-card">
                <img src={poster} alt={it.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent flex items-end justify-center pb-3">
                  <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
                {typeof it.progress === "number" && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-black/40">
                    <div className="h-full" style={{ width: `${it.progress}%`, background: "#FF2D8F" }} />
                  </div>
                )}
              </div>
              <p className="text-[12px] font-medium text-foreground mt-1.5 line-clamp-1">{it.title}</p>
              {it.type === "tv" && (
                <p className="text-[10px] text-muted-foreground">S{it.season} · E{it.episode}</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default TmdbContinueRow;
