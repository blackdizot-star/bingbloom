import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { TmdbItem, img } from "@/lib/tmdb";

interface TmdbCardProps {
  item: TmdbItem;
  type?: "movie" | "tv";
  width?: number;
  fill?: boolean;
  rank?: number;
}

/** NowAnime/MovieBox-style compact poster card. */
const TmdbCard = ({ item, type, width, fill, rank }: TmdbCardProps) => {
  const ranked = rank !== undefined;
  const mediaType = type || item.media_type || (item.first_air_date ? "tv" : "movie");
  const to = `/${mediaType}/${item.id}`;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const poster = img(item.poster_path, "w300") || "/placeholder.svg";

  const sizingClass = fill
    ? "w-full"
    : ranked ? "w-[142px] sm:w-[180px] md:w-[220px]" : "w-[108px] sm:w-[132px] md:w-[168px] lg:w-[184px]";
  const inlineStyle = !fill && width ? { width, minWidth: width } : undefined;

  return (
    <Link
      to={to}
      className={`group relative flex-shrink-0 snap-start ${ranked ? "flex items-end pl-8 md:pl-14" : ""} ${sizingClass}`}
      style={inlineStyle}
    >
      {rank !== undefined && (
        <span className="absolute bottom-5 left-0 z-0 font-display text-[92px] md:text-[150px] leading-none text-card select-none transition-colors group-hover:text-secondary">
          {rank}
        </span>
      )}
      <div className={`aspect-[2/3] overflow-hidden relative z-10 bg-card ring-1 ring-border shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-foreground/25 ${ranked ? "w-[108px] sm:w-[140px] md:w-[168px]" : "w-full"}`}>
        <img
          src={poster}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="rounded-full bg-foreground p-2.5 text-background shadow-xl">
            <Play className="w-3.5 h-3.5 fill-current" />
          </span>
        </div>
      </div>
      <div className={`mt-2 ${ranked ? "ml-8 md:ml-14" : ""}`}>
        <p className="text-[11px] md:text-[12px] font-semibold text-foreground line-clamp-1 group-hover:text-primary">{item.title}</p>
        <p className="text-[9px] md:text-[10px] uppercase text-muted-foreground">{mediaType === "tv" ? "Series" : "Movie"}{year ? ` · ${year}` : ""}</p>
      </div>
    </Link>
  );
};

export default TmdbCard;
