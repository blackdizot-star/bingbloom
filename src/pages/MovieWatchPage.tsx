import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import MoviePlayer, { ServerId } from "@/components/MoviePlayer";
import SEO from "@/components/SEO";
import InlineAdRow from "@/components/InlineAdRow";
import NativeAd from "@/components/NativeAd";
import ResponsiveScriptAd from "@/components/ResponsiveScriptAd";


import TmdbRow from "@/components/TmdbRow";
import Footer from "@/components/Footer";
import {
  useMovieDetail,
  useMovieSimilar,
  useMovieRecommendations,
  useTrendingMovies,
  usePopularMovies,
  useTopRatedMovies,
} from "@/hooks/useTmdb";
import { img } from "@/lib/tmdb";
import { recordContinue } from "@/components/TmdbContinueRow";

const MovieWatchPage = () => {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const { data } = useMovieDetail(tmdbId);
  const similar = useMovieSimilar(tmdbId);
  const recommended = useMovieRecommendations(tmdbId);
  const trending = useTrendingMovies();
  const popular = usePopularMovies();
  const topRated = useTopRatedMovies();
  const suggestions = (similar.data && similar.data.length > 0 ? similar.data : recommended.data) || [];
  const cast = (data?.credits?.cast || []).slice(0, 15);
  const [server, setServer] = useState<ServerId>("vidbolt");

  useLayoutEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (data) {
      recordContinue({
        id: data.id, type: "movie", title: data.title,
        poster_path: data.poster_path, backdrop_path: data.backdrop_path, progress: 5,
      });
    }
  }, [data]);

  const year = (data?.release_date || "").slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
      <SEO
        title={data ? `Watch ${data.title} – MovieNoir` : "Watch Movie – MovieNoir"}
        description={data?.overview?.slice(0, 160) || "Stream movies in HD on MovieNoir."}
        type="video.movie"
      />
      <div className="flex-1 max-w-[1180px] mx-auto w-full">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-3 h-11 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/5">
          <Link to={tmdbId ? `/movie/${tmdbId}` : "/home"} className="p-1.5 -ml-1 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
          <h1 className="text-[13px] font-semibold text-white truncate">{data?.title || "Watch"}</h1>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 lg:px-4 lg:pt-3">
          <div className="min-w-0">
            <div className="w-full md:max-w-2xl md:mx-auto lg:max-w-[820px] lg:mx-0">
              <ResponsiveScriptAd className="border-b border-border/40" />
              <MoviePlayer
                tmdbId={tmdbId || ""}
                type="movie"
                serverId={server}
                onServerChange={setServer}
                title={data?.title}
                year={year}
                poster={data?.poster_path ? img(data.poster_path, "w500") : null}
                backdrop={data?.backdrop_path ? img(data.backdrop_path, "w780") : null}
                onNext={suggestions[0] ? () => { window.location.href = `/watch/movie/${suggestions[0].id}`; } : undefined}
                nextItem={suggestions[0] ? { title: suggestions[0].title, poster: suggestions[0].poster_path ? img(suggestions[0].poster_path, "w200") : null, subtitle: (suggestions[0].release_date || "").slice(0,4) } : null}
              />
            </div>


            {data && (
              <div className="px-4 pb-4 lg:px-0">
                <div className="pt-3">
                  <h2 className="text-base font-bold text-white tracking-tight">{data.title}</h2>
                  <p className="text-[10.5px] text-white/55 mt-0.5">
                    {year}{data.runtime ? ` · ${data.runtime} min` : ""}
                  </p>
                </div>

                <NativeAd compact height={110} desktopHeight={160} className="!px-0 !my-3" />

                {/* Mobile/tablet: horizontal suggestions. Desktop shows list in sidebar. */}
                <section className="mt-4 lg:hidden">
                  <h3 className="text-[12px] font-semibold text-white mb-2">You May Also Like</h3>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
                    {suggestions.slice(0, 20).map((m: any) => (
                      <Link
                        key={m.id}
                        to={`/watch/movie/${m.id}`}
                        className="relative flex-shrink-0 w-[110px] aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10"
                      >
                        {(m.backdrop_path || m.poster_path) && (
                          <img src={img(m.backdrop_path || m.poster_path, "w300")} alt={m.title} loading="lazy" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-1 right-1 grid place-items-center w-5 h-5 rounded-full bg-[#FF2D8F]">
                          <Play className="w-2.5 h-2.5 text-white fill-white" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>

                {data.overview && (
                  <section className="mt-4">
                    <h3 className="text-[12px] font-semibold text-white mb-1">Synopsis</h3>
                    <p className="text-[11px] leading-relaxed text-white/65 line-clamp-3">{data.overview}</p>
                  </section>
                )}

                {cast.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-[12px] font-semibold text-white mb-1.5">Cast</h3>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                      {cast.map((c: any) => (
                        <div key={c.credit_id || c.id} className="flex-shrink-0 w-11 text-center">
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-white/5 mx-auto">
                            <img src={img(c.profile_path, "w200") || "/placeholder.svg"} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 -mx-4 lg:mx-0">
                  <InlineAdRow count={4} />
                </div>

                <div className="mt-2 -mx-4 lg:mx-0 space-y-0.5">
                  <TmdbRow title="Trending Now" items={trending.data} isLoading={trending.isLoading} type="movie" />
                  <TmdbRow title="Popular Movies" items={popular.data} isLoading={popular.isLoading} type="movie" />
                  <TmdbRow title="Top Rated" items={topRated.data} isLoading={topRated.isLoading} type="movie" ranked />
                </div>

                <div className="mt-2 -mx-4 lg:mx-0">
                  <InlineAdRow count={4} />
                </div>
              </div>
            )}
          </div>

          {/* Desktop sidebar — YouTube-style suggestions column */}
          <aside className="hidden lg:block w-[320px] shrink-0 pt-1">
            <div className="sticky top-14 space-y-4">
              <div>
                <h3 className="text-[13px] font-semibold text-white mb-2">Up Next</h3>
                <div className="space-y-2">
                  {suggestions.slice(0, 12).map((m: any) => (
                    <Link
                      key={m.id}
                      to={`/watch/movie/${m.id}`}
                      className="flex gap-2 group"
                    >
                      <div className="relative w-[160px] aspect-video rounded-lg overflow-hidden bg-white/5 shrink-0 border border-white/5">
                        {(m.backdrop_path || m.poster_path) && (
                          <img src={img(m.backdrop_path || m.poster_path, "w300")} alt={m.title} loading="lazy" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-1 right-1 grid place-items-center w-5 h-5 rounded-full bg-[#FF2D8F] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-2.5 h-2.5 text-white fill-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#FF2D8F]">
                          {m.title}
                        </p>
                        <p className="text-[10px] text-white/50 mt-1">
                          {(m.release_date || "").slice(0, 4)}
                          {m.vote_average ? ` · ★ ${m.vote_average.toFixed(1)}` : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MovieWatchPage;
