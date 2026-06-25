import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, Search, Film, Tv, ShieldCheck, Zap } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import { useMovieDetail, useTvDetail } from "@/hooks/useTmdb";
import { img } from "@/lib/tmdb";

/**
 * /download/:mediaType/:id            -> movie
 * /download/:mediaType/:id/:s/:e      -> tv episode
 *
 * Part 1 + Part 2: Mimics videodownloader.site UI and auto-redirects with the
 * media title pre-filled so the user lands directly on the download options.
 */
const DownloadPage = () => {
  const { mediaType = "movie", id = "", s, e } = useParams();
  const [params] = useSearchParams();
  const isTv = mediaType === "tv" || mediaType === "anime";

  const movie = useMovieDetail(!isTv ? id : undefined);
  const tv = useTvDetail(isTv ? id : undefined);
  const data: any = isTv ? tv.data : movie.data;

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

  // Auto-redirect once the title is known. Open in a new tab so the user keeps
  // BingBloom open and lands on the pre-filled download options.
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
      {/* Modal-style overlay so the app still feels alive behind it */}
      <div className="relative">
        {/* Soft red glow only behind the card */}
        <div className="absolute inset-x-0 top-0 h-72 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[460px] h-[460px] rounded-full blur-3xl opacity-25"
               style={{ background: "radial-gradient(circle, #E50914 0%, transparent 60%)" }} />
          {data && (data.backdrop_path || data.poster_path) && (
            <>
              <img
                src={img(data.backdrop_path, "w780") || img(data.poster_path, "w500")}
                alt=""
                className="w-full h-full object-cover opacity-15"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/70 to-[#0A0A0A]" />
            </>
          )}
        </div>

        <div className="relative max-w-xl mx-auto px-4 py-5">
          <Link
            to={-1 as any}
            className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white mb-5"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          {/* Media preview header */}
          {data && (
            <div className="flex gap-3 mb-5">
              {(data.poster_path) && (
                <img
                  src={img(data.poster_path, "w300")}
                  alt={mediaTitle}
                  className="w-20 h-28 object-cover rounded-lg border border-white/10 shadow-lg"
                />
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-end">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#E50914] mb-1">
                  {isTv ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                  {isTv ? "TV Episode" : "Movie"}
                </span>
                <h1 className="text-base md:text-lg font-extrabold text-white leading-tight">{mediaTitle || "Loading…"}</h1>
                {isTv && s && e && (
                  <p className="text-[11px] text-white/60 mt-0.5">Season {s} · Episode {e}</p>
                )}
              </div>
            </div>
          )}

          {/* Main card */}
          <div
            className="relative rounded-2xl p-5 border border-white/10"
            style={{
              background: "linear-gradient(180deg, rgba(229,9,20,0.08) 0%, #141414 35%, #0A0A0A 100%)",
              boxShadow: "0 0 40px rgba(229,9,20,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
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

            {/* Feature pills */}
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

          <p className="text-[10px] text-white/40 leading-relaxed mt-4 text-center px-2">
            Powered by videodownloader.site. For personal offline viewing only — please respect copyright laws in your region.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default DownloadPage;
