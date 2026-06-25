import { useMovieDetail, useTvDetail } from "@/hooks/useTmdb";
import { img } from "@/lib/tmdb";
import { User } from "lucide-react";

interface Props {
  tmdbId: string;
  type: "movie" | "tv";
}

const TmdbCastSection = ({ tmdbId, type }: Props) => {
  const movie = useMovieDetail(type === "movie" ? tmdbId : undefined);
  const tv = useTvDetail(type === "tv" ? tmdbId : undefined);
  const data = type === "movie" ? movie.data : tv.data;
  const cast = data?.credits?.cast?.slice(0, 12) || [];

  if (cast.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Top Cast</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {cast.map((c: any) => {
          const photo = img(c.profile_path, "w200");
          return (
            <div key={c.cast_id ?? c.credit_id ?? c.id} className="flex-shrink-0 w-20 sm:w-24 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden bg-white/5">
                {photo ? (
                  <img src={photo} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white/40" />
                  </div>
                )}
              </div>
              <p className="text-[11px] font-medium text-white mt-1.5 line-clamp-2">{c.name}</p>
              {c.character && (
                <p className="text-[10px] text-white/50 line-clamp-1">{c.character}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TmdbCastSection;
