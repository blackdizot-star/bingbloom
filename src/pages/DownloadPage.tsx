import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, Search, Film, Tv, ShieldCheck, Zap, Play } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import {
  useMovieDetail,
  useTvDetail,
  useTrendingMovies,
  useTrendingTv,
} from "@/hooks/useTmdb";
import { img } from "@/lib/tmdb";

/**
 * /download/:mediaType/:id            -> movie
 * /download/:mediaType/:id/:s/:e      -> tv episode
 *
 * Player-style layout: hero + downloader on the left, "Suggested Downloads"
 * sidebar on the right (mirrors the movie/tv watch page shell).
 */
const DownloadPage = () => {
  const { mediaType = "movie", id = "", s, e } = useParams();
  const [params] = useSearchParams();
  const isTv = mediaType === "tv" || mediaType === "anime";

  const movie = useMovieDetail(!isTv ? id : undefined);
  const tv = useTvDetail(isTv ? id : undefined);
  const data: any = isTv ? tv.data : movie.data;

  const trendingMovies = useTrendingMovies();
  const trendingTv = useTrendingTv();
  const suggestions = (isTv ? trendingTv.data : trendingMovies.data) || [];

  const titleFromQuery = params.get("title") || "";
  const mediaTitle = useMemo(() => {
    if (titleFromQuery) return titleFromQuery;
    if (!data) return "";
    const base = isTv ? data.name : data.title;
    if (isTv && s && e) return `${base} S${String(s).padStart(2, "0")}E${String(e).padStart(2, "0")}`;
    if (!isTv && data.release_date) return `${base} ${data.release_date.slice(0, 4)}`;
    return base || "";
  }, [data, titleFromQuery, isTv, s, e]);

  const [query, setQuery] = useState(mediaTitle);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (mediaTitle && !query) setQuery(mediaTitle);
  }, [mediaTitle]);

  const targetUrl = useMemo(
    () => `https://videodownloader.site/?q=${encodeURIComponent(query || mediaTitle)}`,
    [query, mediaTitle]
  );

  useEffect(() => {
    if (!mediaTitle || redirected) return;
    setRedirected(true);
    const t = setTimeout(() => {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }, 600);
    return () => clearTimeout(t);
  }, [mediaTitle, redirected, targetUrl]);

  const handleSearch = (ev: React.FormEvent) => {
    ev.preventDefault();
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <AppLayout>
      <SEO
        title={mediaTitle ? `Download ${mediaTitle} – BingBloom` : "Download – BingBloom"}
        description="Download movies and episodes for offline viewing on BingBloom."
      />
      <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
        <div className="max-w-[1180px] mx-auto w-full">
          <header className="sticky top-0 z-30 flex items-center gap-3 px-3 h-11 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/5">
            <Link to={-1 as any} className="p-1.5 -ml-1 rounded-full hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 text-white" />
            </Link>
            <h1 className="text-[13px] font-semibold text-white truncate">
              {mediaTitle ? `Download ${mediaTitle}` : "Download"}
            </h1>
          </header>

          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 lg:px-4 lg:pt-3">
            <div className="min-w-0 px-4 py-4 lg:px-0">
              {/* Player-style hero */}
              <div
                className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10"
                style={{ background: "#141414" }}
              >
                {data && (data.backdrop_path || data.poster_path) && (
                  <>
                    <img
                      src={img(data.backdrop_path, "w780") || img(data.poster_path, "w780")}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
                  </>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <div
                    className="w-14 h-14 grid place-items-center rounded-2xl"
                    style={{ background: "#E50914", boxShadow: "0 0 28px rgba(229,9,20,0.55)" }}
                  >
                    <Download className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-white text-base md:text-lg font-extrabold">
                    {mediaTitle || "Preparing download…"}
                  </p>
                  {isTv && s && e && (
                    <p className="text-[11px] text-white/60">Season {s} · Episode {e}</p>
                  )}
                </div>
              </div>

              {/* Downloader card */}
              <div
                className="mt-4 rounded-2xl p-5 border border-white/10"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(229,9,20,0.08) 0%, #141414 35%, #0A0A0A 100%)",
                  boxShadow:
                    "0 0 40px rgba(229,9,20,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 grid place-items-center rounded-xl shrink-0"
                    style={{ background: "#E50914", boxShadow: "0 0 24px rgba(229,9,20,0.55)" }}
                  >
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-extrabold text-white leading-tight">Offline Downloader</h2>
                    <p className="text-[11px] text-white/55">HD · 720p · 1080p · MP4</p>
                  </div>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                  <div className="flex-1 flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#E50914]/60 transition-colors">
                    <Search className="w-4 h-4 text-white/50" />
                    <input
                      value={query}
                      onChange={(ev) => setQuery(ev.target.value)}
                      placeholder="Title to download…"
                      className="flex-1 bg-transparent outline-none text-xs text-white placeholder:text-white/40"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2.5 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5 transition-transform active:scale-95"
                    style={{ background: "#E50914", boxShadow: "0 0 20px rgba(229,9,20,0.4)" }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Go
                  </button>
                </form>

                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-extrabold text-white transition-transform active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(180deg, #FF1A26 0%, #E50914 100%)",
                    boxShadow: "0 0 28px rgba(229,9,20,0.55), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  <Download className="w-4 h-4" /> Download Now
                </a>

                {redirected && (
                  <p className="text-[10px] text-white/50 mt-2 text-center">
                    A new tab opened with pre-filled results. If blocked, tap above.
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 mt-5">
                  <div className="rounded-lg bg-white/[0.03] border border-white/10 px-2 py-2 text-center">
                    <Zap className="w-3.5 h-3.5 mx-auto text-[#E50914] mb-1" />
                    <p className="text-[10px] font-semibold text-white">Fast</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/10 px-2 py-2 text-center">
                    <ShieldCheck className="w-3.5 h-3.5 mx-auto text-[#E50914] mb-1" />
                    <p className="text-[10px] font-semibold text-white">Safe</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/10 px-2 py-2 text-center">
                    <Film className="w-3.5 h-3.5 mx-auto text-[#E50914] mb-1" />
                    <p className="text-[10px] font-semibold text-white">HD</p>
                  </div>
                </div>
              </div>

              {/* Mobile suggestions strip */}
              <section className="mt-5 lg:hidden">
                <h3 className="text-[12px] font-semibold text-white mb-2">Suggested Downloads</h3>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
                  {suggestions.slice(0, 20).map((m: any) => (
                    <Link
                      key={m.id}
                      to={`/download/${isTv ? "tv" : "movie"}/${m.id}`}
                      className="relative flex-shrink-0 w-[110px] aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10"
                    >
                      {(m.backdrop_path || m.poster_path) && (
                        <img
                          src={img(m.backdrop_path || m.poster_path, "w300")}
                          alt={m.title || m.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute bottom-1 right-1 grid place-items-center w-5 h-5 rounded-full bg-[#E50914]">
                        <Download className="w-2.5 h-2.5 text-white" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <p className="text-[10px] text-white/40 leading-relaxed mt-4 text-center px-2">
                Powered by videodownloader.site. For personal offline viewing only — please respect copyright laws in your region.
              </p>
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-[320px] shrink-0 pt-4">
              <div className="sticky top-14 space-y-3">
                <h3 className="text-[13px] font-semibold text-white">Suggested Downloads</h3>
                <div className="space-y-2 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
                  {suggestions.slice(0, 14).map((m: any) => (
                    <Link
                      key={m.id}
                      to={`/download/${isTv ? "tv" : "movie"}/${m.id}`}
                      className="flex gap-2 group hover:bg-white/5 p-1.5 rounded-lg border border-transparent"
                    >
                      <div className="relative w-[140px] aspect-video rounded-md overflow-hidden bg-white/5 shrink-0 border border-white/5">
                        {(m.backdrop_path || m.poster_path) && (
                          <img
                            src={img(m.backdrop_path || m.poster_path, "w300")}
                            alt={m.title || m.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute bottom-1 right-1 grid place-items-center w-5 h-5 rounded-full bg-[#E50914] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Download className="w-2.5 h-2.5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#E50914]">
                          {m.title || m.name}
                        </p>
                        <p className="text-[10px] text-white/50 mt-1">
                          {(m.release_date || m.first_air_date || "").slice(0, 4)}
                          {m.vote_average ? ` · ★ ${m.vote_average.toFixed(1)}` : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DownloadPage;
