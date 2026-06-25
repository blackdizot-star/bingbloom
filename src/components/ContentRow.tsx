import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import ContentCard from "./ContentCard";
import type { NormalizedVideo } from "@/hooks/useKenyaContent";

type LayoutType = "scroll" | "grid" | "featured" | "list" | "wide" | "poster";

interface ContentRowProps {
  title: string;
  items: NormalizedVideo[];
  isLoading?: boolean;
  layout?: LayoutType;
  viewAllLink?: string;
}

const ContentRow = ({ title, items, isLoading, layout = "scroll", viewAllLink }: ContentRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-sm font-semibold px-5 mb-3 text-foreground">{title}</h2>
        <div className="flex gap-3 px-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-[130px] flex-shrink-0">
              <div className="aspect-[2/3] bg-card rounded-xl animate-pulse" />
              <div className="h-2.5 bg-card rounded mt-1.5 w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (items.length === 0) return null;

  const seen = new Set<string>();
  const unique = items.filter(v => { if (seen.has(v.id)) return false; seen.add(v.id); return true; });

  const variant = layout === "wide" ? "wide" : "poster";
  const isScrollable = layout === "scroll" || layout === "poster" || layout === "wide";

  return (
    <section className="mb-8 group/row relative animate-fade-in">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {viewAllLink && (
          <a href={viewAllLink} className="text-[11px] text-primary font-medium hover:underline">See All →</a>
        )}
      </div>

      {isScrollable && (
        <div className="relative">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-8 z-10 w-10 bg-gradient-to-r from-background via-background/80 to-transparent hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div ref={scrollRef} className="flex gap-3 px-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x">
            {unique.map((item) => <ContentCard key={item.id} video={item} variant={variant} />)}
          </div>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-8 z-10 w-10 bg-gradient-to-l from-background via-background/80 to-transparent hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
      )}

      {layout === "grid" && (
        <div className="px-5">
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {(expanded ? unique : unique.slice(0, 14)).map((item) => (
              <ContentCard key={item.id} video={item} />
            ))}
          </div>
          {unique.length > 14 && (
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mx-auto mt-3 text-[11px] text-primary font-medium hover:underline">
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? "Show Less" : `View All (${unique.length})`}
            </button>
          )}
        </div>
      )}

      {layout === "featured" && unique.length > 0 && (
        <div className="px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {unique.slice(0, 8).map((item) => (
              <ContentCard key={item.id} video={item} variant="wide" />
            ))}
          </div>
        </div>
      )}

      {layout === "list" && (
        <div className="px-5 space-y-1.5">
          {(expanded ? unique : unique.slice(0, 6)).map((item, i) => (
            <a key={item.id} href={`/watch/${item.id}`} className="flex gap-3 items-center p-2.5 rounded-xl bg-card hover:bg-secondary transition-colors group">
              <span className="text-sm font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
              <div className="w-20 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground line-clamp-2">{item.title}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{item.channel}</p>
              </div>
            </a>
          ))}
          {unique.length > 6 && (
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mx-auto text-[11px] text-primary font-medium hover:underline">
              {expanded ? "Show Less" : `Show All (${unique.length})`}
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default ContentRow;
