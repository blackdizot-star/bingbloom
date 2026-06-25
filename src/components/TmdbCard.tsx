import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
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
  const mediaType = type || item.media_type || (item.first_air_date ? "tv" : "movie");
  const to = `/${mediaType}/${item.id}`;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const poster = img(item.poster_path, "w300") || "/placeholder.svg";

  const sizingClass = fill
    ? "w-full"
    : "w-[96px] sm:w-[120px] md:w-[140px] lg:w-[150px]";
  const inlineStyle = !fill && width ? { width, minWidth: width } : undefined;

  return (
    <Link
      to={to}
      className={`group flex-shrink-0 snap-start ${sizingClass}`}
      style={inlineStyle}
    >
      <div className="aspect-[2/3] rounded-md overflow-hidden relative bg-surface-2 shadow-md transition-transform duration-200 group-hover:-translate-y-1">
        <img
          src={poster}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="rounded-full bg-primary p-2.5 text-primary-foreground shadow-xl">
            <Play className="w-3.5 h-3.5 fill-current" />
          </span>
        </div>
        {item.vote_average > 0 && (
          <div className="absolute top-1 left-1 flex items-center gap-0.5 rounded-sm bg-black/65 px-1 py-0.5 text-[9px] font-semibold text-primary">
            <Star className="w-2.5 h-2.5 fill-current" /> {item.vote_average.toFixed(1)}
          </div>
        )}
        <div className="absolute top-1 right-1 rounded-sm bg-primary/90 px-1 py-[1px] text-[8px] font-bold uppercase tracking-wide text-primary-foreground">
          {mediaType === "tv" ? "TV" : "Movie"}
        </div>
        {rank !== undefined && (
          <div className="absolute bottom-0 left-0 flex h-full w-7 flex-col items-center justify-end bg-gradient-to-t from-black/90 to-transparent">
            <span className="mb-1 text-lg font-black text-primary">{String(rank).padStart(2, "0")}</span>
          </div>
        )}
      </div>
      <div className="mt-1 px-0.5">
        <p className="text-[11px] md:text-[12px] font-medium text-foreground line-clamp-1 group-hover:text-primary">{item.title}</p>
        {year && <p className="text-[9px] md:text-[10px] text-muted-foreground">{year}</p>}
      </div>
    </Link>
  );
};

export default TmdbCard;
