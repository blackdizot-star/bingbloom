import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Check, ChevronDown } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import MoviePlayer, { ServerId } from "@/components/MoviePlayer";
import SEO from "@/components/SEO";
import InlineAdRow from "@/components/InlineAdRow";

import TmdbRow from "@/components/TmdbRow";
import Footer from "@/components/Footer";
import { useTvDetail, useTvSeason, useTrendingTv, usePopularTv, useTopRatedTv } from "@/hooks/useTmdb";
import { img } from "@/lib/tmdb";
import { recordContinue } from "@/components/TmdbContinueRow";

const TvWatchPage = () => {
  const { tmdbId, season, episode } = useParams<{ tmdbId: string; season: string; episode: string }>();
  const { data } = useTvDetail(tmdbId);
  const seasonNum = Number(season || 1);
  const episodeNum = Number(episode || 1);
  const [activeSeason, setActiveSeason] = useState<number>(seasonNum);
  const [server, setServer] = useState<ServerId>("hd");
  useEffect(() => setActiveSeason(seasonNum), [seasonNum]);
  const seasonQuery = useTvSeason(tmdbId, activeSeason);
  const seasons = (data?.seasons || []).filter((s: any) => s.season_number > 0);
  const cast = (data?.credits?.cast || []).slice(0, 15);
  const trending = useTrendingTv();
  const popular = usePopularTv();
  const topRated = useTopRatedTv();

  useLayoutEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (data) {
      recordContinue({
        id: data.id, type: "tv", title: data.name,
        poster_path: data.poster_path, backdrop_path: data.backdrop_path,
        season: seasonNum, episode: episodeNum, progress: 5,
      });
    }
  }, [data, seasonNum, episodeNum]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
      <SEO
        title={data ? `${data.name} S${seasonNum}E${episodeNum} – BingBloom` : "Watch TV – BingBloom"}
        description={data?.overview?.slice(0, 160) || "Stream TV episodes in HD on BingBloom."}
        type="video.episode"
      />
      <div className="flex-1 max-w-[1400px] mx-auto w-full">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-3 h-11 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/5">
          <Link to={tmdbId ? `/tv/${tmdbId}` : "/home"} className="p-1.5 -ml-1 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
          <h1 className="text-[13px] font-semibold text-white truncate">
            {data ? `${data.name} · S${seasonNum} E${episodeNum}` : "Watch"}
          </h1>
        </header>

        <div className="w-full md:max-w-2xl lg:max-w-3xl md:mx-auto">
          <MoviePlayer
            tmdbId={tmdbId || ""}
            type="tv"
            season={seasonNum}
            episode={episodeNum}
            serverId={server}
            onServerChange={setServer}
            title={data?.name}
            year={(data?.first_air_date || "").slice(0, 4)}
            poster={data?.poster_path ? img(data.poster_path, "w500") : null}
            backdrop={data?.backdrop_path ? img(data.backdrop_path, "w780") : null}
          />
        </div>




        {data && (
          <div className="px-4 pb-4">
            <div className="flex items-start justify-between gap-3 pt-3 flex-wrap">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white tracking-tight">{data.name}</h2>
                <p className="text-[10.5px] text-white/55 mt-0.5">Season {seasonNum} · Episode {episodeNum}</p>
              </div>
              {seasons.length > 0 && (
                <div className="relative">
                  <select
                    value={activeSeason}
                    onChange={(e) => setActiveSeason(Number(e.target.value))}
                    className="appearance-none bg-white/8 text-white text-[11px] pl-3 pr-7 py-1.5 rounded-lg border border-white/10"
                  >
                    {seasons.map((s: any) => (
                      <option key={s.id} value={s.season_number} className="bg-[#1a1a1a]">
                        Season {s.season_number}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-white/70 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            <section className="mt-4">
              <h3 className="text-[12px] font-semibold text-white mb-2">Episodes</h3>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
                {seasonQuery.isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-[110px] h-[68px] bg-white/5 rounded-lg animate-pulse" />
                    ))
                  : (seasonQuery.data?.episodes || []).map((ep: any) => {
                      const isPlaying = activeSeason === seasonNum && ep.episode_number === episodeNum;
                      return (
                        <Link
                          key={ep.id}
                          to={`/watch/tv/${data.id}/${activeSeason}/${ep.episode_number}`}
                          className={`relative flex-shrink-0 w-[110px] aspect-video rounded-lg overflow-hidden bg-white/5 ${isPlaying ? "neon-playing" : "border border-white/10"}`}
                        >
                          {ep.still_path && (
                            <img src={img(ep.still_path, "w300")} alt={ep.name} loading="lazy" className="w-full h-full object-cover" />
                          )}
                          <span className="absolute top-1 left-1 text-[9px] font-extrabold text-white">E{ep.episode_number}</span>
                          {isPlaying && (
                            <span className="absolute bottom-1 right-1 grid place-items-center w-4 h-4 rounded-full bg-[#E50914]">
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </span>
                          )}
                        </Link>
                      );
                    })}
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

            <div className="mt-3 -mx-4">
              <InlineAdRow count={4} />
            </div>

            <div className="mt-2 -mx-4 space-y-0.5">
              <TmdbRow title="Trending TV" items={trending.data} isLoading={trending.isLoading} type="tv" />
              <TmdbRow title="Popular Shows" items={popular.data} isLoading={popular.isLoading} type="tv" />
              <TmdbRow title="Top Rated" items={topRated.data} isLoading={topRated.isLoading} type="tv" ranked />
            </div>

            <div className="mt-2 -mx-4">
              <InlineAdRow count={4} />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TvWatchPage;
