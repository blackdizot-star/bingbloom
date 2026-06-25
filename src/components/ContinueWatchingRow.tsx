import { useRef } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import ContentCard from "./ContentCard";
import { useContinueWatching } from "@/hooks/useContinueWatching";

const ContinueWatchingRow = () => {
  const entries = useContinueWatching();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (entries.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  };

  return (
    <section className="mb-10 group/row relative animate-fade-in">
      <div className="flex items-center gap-2 px-6 mb-4">
        <Clock className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Continue Watching</h2>
      </div>
      <div className="relative">
        <button onClick={() => scroll("left")} className="absolute left-0 top-0 bottom-10 z-10 w-12 bg-gradient-to-r from-background to-transparent hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <div ref={scrollRef} className="flex gap-4 px-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x">
          {entries.map((e) => (
            <ContentCard key={e.video.id} video={e.video} progress={e.progress} variant="wide" />
          ))}
        </div>
        <button onClick={() => scroll("right")} className="absolute right-0 top-0 bottom-10 z-10 w-12 bg-gradient-to-l from-background to-transparent hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      </div>
    </section>
  );
};

export default ContinueWatchingRow;
