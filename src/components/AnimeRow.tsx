import { useRef } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import AnimeCard from "./AnimeCard";
import type { NormalizedVideo } from "@/hooks/useKenyaContent";

const AnimeRow = ({ title, items, isLoading }: { title: string; items: NormalizedVideo[]; isLoading?: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <section className="mb-3 group/row relative">
      <h2 className="text-sm font-display tracking-wide px-2 mb-1 text-foreground">{title}</h2>
      {isLoading ? (
        <div className="flex items-center justify-center h-24 px-2">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="px-2 text-[10px] text-muted-foreground">No content found</p>
      ) : (
        <div className="relative">
          <button onClick={() => scroll("left")} className="absolute left-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-r from-background/80 to-transparent hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
            <ChevronLeft className="w-3.5 h-3.5 text-foreground" />
          </button>
          <div ref={scrollRef} className="flex gap-1.5 px-2 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory">
            {items.map((item) => <AnimeCard key={item.id} video={item} />)}
          </div>
          <button onClick={() => scroll("right")} className="absolute right-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-l from-background/80 to-transparent hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
            <ChevronRight className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>
      )}
    </section>
  );
};

export default AnimeRow;
