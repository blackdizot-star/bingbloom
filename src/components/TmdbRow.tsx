import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TmdbItem } from "@/lib/tmdb";
import TmdbCard from "./TmdbCard";

interface TmdbRowProps {
  title: string;
  items?: TmdbItem[];
  isLoading?: boolean;
  type?: "movie" | "tv";
  viewAll?: string;
  ranked?: boolean;
}

const TmdbRow = ({ title, items, isLoading, type, viewAll, ranked }: TmdbRowProps) => {
  if (!isLoading && (!items || items.length === 0)) return null;

  return (
    <section className="mb-8 md:mb-14">
      <div className="flex items-center justify-between px-[4%] mb-4 md:mb-7">
        <h2 className="font-display text-2xl md:text-4xl text-foreground">{title}</h2>
        {viewAll && (
          <Link to={viewAll} className="flex items-center gap-1 text-[10px] md:text-xs uppercase text-muted-foreground font-semibold hover:text-foreground">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className={`flex px-[4%] overflow-x-auto scrollbar-hide pb-5 snap-x snap-mandatory ${ranked ? "gap-4 md:gap-8" : "gap-3 md:gap-5"}`}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[108px] sm:w-[132px] md:w-[168px] aspect-[2/3] bg-card animate-pulse" />
            ))
          : items!.slice(0, 20).map((item, idx) => (
              <TmdbCard
                key={`${item.id}-${item.media_type ?? type}`}
                item={item}
                type={type}
                rank={ranked ? idx + 1 : undefined}
              />
            ))}
      </div>
    </section>
  );
};

export default TmdbRow;
