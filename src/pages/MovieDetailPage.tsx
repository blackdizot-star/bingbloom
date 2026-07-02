import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Play, ArrowLeft, Calendar, Clock, Film } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import TmdbRow from "@/components/TmdbRow";
import TrailerModal from "@/components/TrailerModal";
import { useMovieDetail, useMovieSimilar, useMovieRecommendations, useTrendingMovies, usePopularMovies, useTopRatedMovies } from "@/hooks/useTmdb";
import { img } from "@/lib/tmdb";
import DownloadButton from "@/components/DownloadButton";
import InlineAdRow from "@/components/InlineAdRow";
import { movieSchema } from "@/lib/seoSchemas";

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useMovieDetail(id);
  const similar = useMovieSimilar(id);
  const recommendations = useMovieRecommendations(id);
  const trending = useTrendingMovies();
  const popular = usePopularMovies();
  const topRated = useTopRatedMovies();
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <AppLayout>
        <div className="relative">
          <div className="h-[55vh] md:h-[70vh] bg-card animate-pulse" />
          <div className="px-[5%] -mt-32 md:-mt-44 relative z-10 pb-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="w-40 md:w-60 aspect-[2/3] rounded-xl bg-card animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-3 pt-4">
                <div className="h-7 w-2/3 bg-card rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-card rounded animate-pulse" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-5 w-14 bg-card rounded-full animate-pulse" />)}
                </div>
                <div className="h-3 w-full bg-card rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-card rounded animate-pulse" />
                <div className="h-3 w-4/6 bg-card rounded animate-pulse" />
                <div className="flex gap-3 pt-2">
                  <div className="h-10 w-32 bg-card rounded-lg animate-pulse" />
                  <div className="h-10 w-28 bg-card rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
            <div className="mt-10 space-y-3">
              <div className="h-4 w-24 bg-card rounded animate-pulse" />
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[90px] aspect-[2/3] bg-card rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const backdrop = img(data.backdrop_path, "original");
  const poster = img(data.poster_path, "w500");
  const cast = (data.credits?.cast || []).slice(0, 15);
  const recs = data.recommendations?.results || [];
  const trailer = (data.videos?.results || []).find((v: any) => v.type === "Trailer" && v.site === "YouTube") ||
    (data.videos?.results || []).find((v: any) => v.site === "YouTube");
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : null;
  const year = (data.release_date || "").slice(0, 4);
  const director = (data.credits?.crew || []).find((c: any) => c.job === "Director")?.name;
  const actorNames = cast.slice(0, 6).map((c: any) => c.name);

  return (
    <AppLayout>
      <SEO
        title={`${data.title}${year ? ` (${year})` : ""} | Watch Free on BingBloom`}
        description={(data.overview || `Watch ${data.title} streaming free on BingBloom. Cast, reviews, trailers and more.`).slice(0, 160)}
        type="video.movie"
        image={img(data.backdrop_path, "w780") || undefined}
        jsonLd={movieSchema({
          title: data.title,
          description: data.overview,
          image: poster || undefined,
          datePublished: data.release_date,
          rating: data.vote_average,
          genres: (data.genres || []).map((g: any) => g.name),
          director,
          actors: actorNames,
        })}
      />
      <div className="relative">
        <div className="relative w-full h-[55vh] md:h-[70vh]">
          {backdrop && <img src={backdrop} alt={data.title} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-transparent to-background/40" />
          <Link to="/home" className="absolute top-4 left-4 z-30 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors backdrop-blur-md">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
        </div>

        <div className="px-[5%] -mt-32 md:-mt-44 relative z-10 pb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {poster && (
              <div className="w-40 md:w-60 aspect-[2/3] rounded-xl shadow-2xl overflow-hidden flex-shrink-0 self-start">
                <img src={poster} alt={data.title} width={500} height={750} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1.5 tracking-tight">{data.title}</h1>
              {data.tagline && <p className="text-xs md:text-sm italic text-muted-foreground mb-2">{data.tagline}</p>}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mb-3">
                {data.vote_average > 0 && (
                  <span className="flex items-center gap-1 text-foreground font-semibold text-xs">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {data.vote_average.toFixed(1)}
                  </span>
                )}
                {data.release_date && (
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {data.release_date.slice(0, 4)}</span>
                )}
                {runtime && (
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {runtime}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(data.genres || []).map((g: any) => (
                  <span key={g.id} className="px-2.5 py-0.5 bg-secondary text-secondary-foreground rounded-full text-[10px] font-medium">{g.name}</span>
                ))}
              </div>
              <p className="text-xs md:text-sm text-foreground/80 leading-relaxed mb-5 max-w-3xl">{data.overview}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/watch/movie/${data.id}`}
                  className="flex items-center gap-2 font-bold px-7 py-3 rounded-lg text-sm transition-transform hover:scale-105 shadow-xl"
                  style={{ background: "#E50914", color: "#fff" }}
                >
                  <Play className="w-4 h-4 fill-current" /> Watch Now
                </Link>
                <DownloadButton
                  id={`movie-${data.id}`}
                  type="movie"
                  tmdbId={String(data.id)}
                  title={data.title}
                  year={(data.release_date || "").slice(0, 4)}
                  poster={img(data.poster_path, "w500")}
                  backdrop={img(data.backdrop_path, "w780")}
                />
              </div>
            </div>

          </div>

          <div className="mt-8 -mx-[5%]">
            <InlineAdRow count={4} />
          </div>

          {cast.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm md:text-base font-semibold text-foreground mb-3">Top Cast</h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {cast.map((c: any) => (
                  <div key={c.cast_id || c.credit_id || c.id} className="flex-shrink-0 w-[90px]">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-card">
                      <img
                        src={img(c.profile_path, "w300") || "/placeholder.svg"}
                        alt={c.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] font-medium text-foreground mt-1 line-clamp-1">{c.name}</p>
                    <p className="text-[9px] text-muted-foreground line-clamp-1">{c.character}</p>
                  </div>
                ))}
              </div>
            </section>
          )}


          {recs.length > 0 && (
            <div className="mt-10 -mx-[5%]">
              <TmdbRow title="More Like This" items={recs} type="movie" />
            </div>
          )}
          <div className="-mx-[5%] space-y-0.5">
            <TmdbRow title="You May Also Like" items={similar.data} isLoading={similar.isLoading} type="movie" />
            <TmdbRow title="Recommended" items={recommendations.data} isLoading={recommendations.isLoading} type="movie" />
            <TmdbRow title="Fan Favorites" items={topRated.data} isLoading={topRated.isLoading} type="movie" ranked />
            <TmdbRow title="Trending Now" items={trending.data} isLoading={trending.isLoading} type="movie" />
            <TmdbRow title="Popular Movies" items={popular.data} isLoading={popular.isLoading} type="movie" />
          </div>
        </div>
      </div>

      <TrailerModal videoKey={trailerKey} onClose={() => setTrailerKey(null)} />
    </AppLayout>
  );
};

export default MovieDetailPage;
