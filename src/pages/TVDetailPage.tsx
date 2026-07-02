import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Play, ArrowLeft, Calendar, Tv, Check } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import TmdbRow from "@/components/TmdbRow";
import DownloadButton from "@/components/DownloadButton";
import { useTvDetail, useTvSeason, useTvSimilar, useTvRecommendations, useTrendingTv, usePopularTv, useTopRatedTv } from "@/hooks/useTmdb";
import { img } from "@/lib/tmdb";
import InlineAdRow from "@/components/InlineAdRow";

const TVDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useTvDetail(id);
  const seasons = (data?.seasons || []).filter((s: any) => s.season_number > 0);
  const [activeSeason, setActiveSeason] = useState<number>(1);
  const seasonQuery = useTvSeason(id, activeSeason);
  const similar = useTvSimilar(id);
  const recommendations = useTvRecommendations(id);
  const trending = useTrendingTv();
  const popular = usePopularTv();
  const topRated = useTopRatedTv();
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [currentEp, setCurrentEp] = useState<number>(1);

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
                <div className="h-3 w-1/2 bg-card rounded animate-pulse" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-5 w-14 bg-card rounded-full animate-pulse" />)}
                </div>
                <div className="h-3 w-full bg-card rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-card rounded animate-pulse" />
                <div className="flex gap-3 pt-2">
                  <div className="h-10 w-32 bg-card rounded-lg animate-pulse" />
                  <div className="h-10 w-28 bg-card rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[140px] aspect-video bg-card rounded-lg animate-pulse" />
              ))}
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

  return (
    <AppLayout>
      <SEO
        title={`${data.name} – Watch on BingBloom`}
        description={(data.overview || `Watch ${data.name} streaming on BingBloom. Episodes, cast, reviews and more.`).slice(0, 160)}
        type="video.tv_show"
        image={img(data.backdrop_path, "w780") || undefined}
        jsonLd={{
          "@type": "TVSeries",
          name: data.name,
          description: data.overview || `Watch ${data.name} on BingBloom.`,
          image: poster || undefined,
          datePublished: data.first_air_date || undefined,
          aggregateRating: data.vote_average > 0 ? {
            "@type": "AggregateRating",
            ratingValue: data.vote_average,
            bestRating: 10,
          } : undefined,
          numberOfSeasons: data.number_of_seasons || undefined,
          numberOfEpisodes: data.number_of_episodes || undefined,
          genre: (data.genres || []).map((g: any) => g.name),
        }}
      />
      <div className="relative">
        <div className="relative w-full h-[55vh] md:h-[70vh]">
          {backdrop && <img src={backdrop} alt={data.name} className="absolute inset-0 w-full h-full object-cover" />}
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
                <img src={poster} alt={data.name} width={500} height={750} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1.5 tracking-tight">{data.name}</h1>
              {data.tagline && <p className="text-xs md:text-sm italic text-muted-foreground mb-2">{data.tagline}</p>}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mb-3">
                {data.vote_average > 0 && (
                  <span className="flex items-center gap-1 text-foreground font-semibold text-xs">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {data.vote_average.toFixed(1)}
                  </span>
                )}
                {data.first_air_date && (
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {data.first_air_date.slice(0, 4)}</span>
                )}
                <span className="flex items-center gap-1"><Tv className="w-3 h-3" /> {data.number_of_seasons} Seasons · {data.number_of_episodes} Eps</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(data.genres || []).map((g: any) => (
                  <span key={g.id} className="px-2.5 py-0.5 bg-secondary text-secondary-foreground rounded-full text-[10px] font-medium">{g.name}</span>
                ))}
              </div>
              <p className="text-xs md:text-sm text-foreground/80 leading-relaxed mb-5 max-w-3xl">{data.overview}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/watch/tv/${data.id}/${activeSeason}/1`}
                  className="flex items-center gap-2 font-bold px-7 py-3 rounded-lg text-sm transition-transform hover:scale-105 shadow-xl"
                  style={{ background: "#E50914", color: "#fff" }}
                >
                  <Play className="w-4 h-4 fill-current" /> Play S{activeSeason} E1
                </Link>
                <DownloadButton
                  id={`tv-${data.id}-s${activeSeason}-e1`}
                  type="tv"
                  tmdbId={String(data.id)}
                  title={data.name}
                  year={(data.first_air_date || "").slice(0, 4)}
                  poster={poster}
                  backdrop={backdrop}
                  season={activeSeason}
                  episode={1}
                />
              </div>
            </div>
          </div>

          {/* Season selector + episode grid */}
          {seasons.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm md:text-base font-semibold text-foreground">New episode card</h2>
                <select
                  value={activeSeason}
                  onChange={e => setActiveSeason(Number(e.target.value))}
                  className="bg-card text-foreground text-xs px-3 py-1.5 rounded-lg border border-border"
                >
                  {seasons.map((s: any) => (
                    <option key={s.id} value={s.season_number}>
                      Season {s.season_number} ({s.episode_count} eps)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-3 pt-2 -mx-[5%] px-[5%] snap-x snap-mandatory">
                {seasonQuery.isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex-shrink-0 w-[140px] h-28 bg-card rounded-lg animate-pulse" />)
                  : (seasonQuery.data?.episodes || []).map((ep: any) => {
                      const isPlaying = ep.episode_number === currentEp;
                      return (
                        <div
                          key={ep.id}
                          className={`flex-shrink-0 w-[140px] md:w-[170px] snap-start ${isPlaying ? "scale-[1.05]" : ""} transition-transform`}
                        >
                          <Link
                            to={`/watch/tv/${data.id}/${activeSeason}/${ep.episode_number}`}
                            onClick={() => setCurrentEp(ep.episode_number)}
                            className={`relative block aspect-video rounded-xl overflow-hidden bg-card ${isPlaying ? "neon-playing" : "border border-white/10"}`}
                          >
                            {ep.still_path && (
                              <img src={img(ep.still_path, "w300")} alt={ep.name} className={`w-full h-full object-cover ${isPlaying ? "opacity-70" : ""}`} loading="lazy" />
                            )}
                            <div className={`absolute inset-0 ${isPlaying ? "bg-gradient-to-b from-[#E50914]/30 via-transparent to-[#E50914]/40" : "bg-gradient-to-t from-black/70 to-transparent"}`} />
                            {isPlaying && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#E50914] text-[8px] font-bold uppercase tracking-wide text-white shadow-lg">
                                Currently Playing
                              </span>
                            )}
                            <span className={`absolute ${isPlaying ? "bottom-1.5 left-1.5" : "top-1.5 left-1.5"} px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-extrabold text-white`}>
                              E{ep.episode_number}
                            </span>
                            <span className="absolute top-1.5 right-1.5 z-10">
                              <DownloadButton
                                size="icon"
                                type="tv"
                                tmdbId={String(data.id)}
                                title={data.name}
                                year={(data.first_air_date || "").slice(0, 4)}
                                poster={poster}
                                backdrop={backdrop}
                                season={activeSeason}
                                episode={ep.episode_number}
                              />
                            </span>
                          </Link>
                          <div className="mt-1.5 flex items-start gap-1.5">
                            <span className={`mt-0.5 w-3.5 h-3.5 rounded-full grid place-items-center flex-shrink-0 ${isPlaying ? "bg-[#E50914]" : "bg-white/15"}`}>
                              {isPlaying && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                            </span>
                            <div className="min-w-0">
                              <p className={`text-[11px] font-bold leading-tight ${isPlaying ? "text-[#E50914]" : "text-white"}`}>
                                S{activeSeason} E{ep.episode_number}
                              </p>
                              <p className={`text-[10px] line-clamp-1 leading-tight ${isPlaying ? "text-[#E50914]/80" : "text-white/50"}`}>
                                {ep.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </section>
          )}

          <div className="mt-8 -mx-[5%]">
            <InlineAdRow count={4} />
          </div>

          {cast.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm md:text-base font-semibold text-foreground mb-3">Top Cast</h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {cast.map((c: any) => (
                  <div key={c.credit_id || c.id} className="flex-shrink-0 w-[90px]">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-card">
                      <img src={img(c.profile_path, "w300") || "/placeholder.svg"} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
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
              <TmdbRow title="More Like This" items={recs} type="tv" />
            </div>
          )}
          <div className="-mx-[5%] space-y-0.5">
            <TmdbRow title="You May Also Like" items={similar.data} isLoading={similar.isLoading} type="tv" />
            <TmdbRow title="Recommended" items={recommendations.data} isLoading={recommendations.isLoading} type="tv" />
            <TmdbRow title="Fan Favorites" items={topRated.data} isLoading={topRated.isLoading} type="tv" ranked />
            <TmdbRow title="Trending Now" items={trending.data} isLoading={trending.isLoading} type="tv" />
            <TmdbRow title="Popular Shows" items={popular.data} isLoading={popular.isLoading} type="tv" />
          </div>
        </div>
      </div>

    </AppLayout>
  );
};

export default TVDetailPage;
