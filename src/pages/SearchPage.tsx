import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, Loader2, Download, AlertCircle, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import TmdbCard from "@/components/TmdbCard";
import InlineAdRow from "@/components/InlineAdRow";

import {
  searchMovies,
  searchTv,
  searchMulti,
  discoverMovies,
  discoverTv,
  GENRES,
  img,
  type TmdbItem,
} from "@/lib/tmdb";

type ResultItem = TmdbItem & { _type: "movie" | "tv"; _bucket: FilterKey };
type FilterKey = "all" | "movies" | "series" | "anime" | "animation";

const FILTERS: { label: string; value: FilterKey }[] = [
  { label: "All", value: "all" },
  { label: "Movies", value: "movies" },
  { label: "Series", value: "series" },
  { label: "Anime", value: "anime" },
  { label: "Animation", value: "animation" },
];

const isAnime = (item: TmdbItem) =>
  item.genre_ids?.includes(GENRES.animation) && (item as any).original_language === "ja";
const isAnimation = (item: TmdbItem) =>
  item.genre_ids?.includes(GENRES.animation) && !isAnime(item);

const SponsoredLabel = () => (
  <p className="text-[9px] uppercase tracking-[0.18em] text-white/45 font-semibold mb-1.5">
    Sponsored · Featured placements
  </p>
);

const useDebounced = <T,>(value: T, delay = 250) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [noResultDialog, setNoResultDialog] = useState(false);
  const [downloadsDialog, setDownloadsDialog] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounced(query, 220);

  const goToDownloads = () => navigate("/my-downloads");

  // Live suggestions (YouTube-style) while typing
  const { data: liveSuggest = [] } = useQuery({
    queryKey: ["search-live", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await searchMulti(debouncedQuery.trim());
      return res
        .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
        .slice(0, 6);
    },
    enabled: debouncedQuery.trim().length > 1,
    staleTime: 1000 * 60,
  });

  const { data: results = [], isFetching } = useQuery<ResultItem[]>({
    queryKey: ["mixed-search", searchQuery],
    queryFn: async () => {
      const [movies, tv] = await Promise.all([
        searchQuery.trim() ? searchMovies(searchQuery) : discoverMovies({}),
        searchQuery.trim() ? searchTv(searchQuery) : discoverTv({}),
      ]);
      const decorated: ResultItem[] = [
        ...movies.map((m) => {
          let bucket: FilterKey = "movies";
          if (isAnime(m)) bucket = "anime";
          else if (isAnimation(m)) bucket = "animation";
          return { ...m, _type: "movie" as const, _bucket: bucket };
        }),
        ...tv.map((t) => {
          let bucket: FilterKey = "series";
          if (isAnime(t)) bucket = "anime";
          else if (isAnimation(t)) bucket = "animation";
          return { ...t, _type: "tv" as const, _bucket: bucket };
        }),
      ];
      return decorated.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    },
    staleTime: 1000 * 60 * 10,
  });

  // Top searches / trending suggestions for empty state
  const { data: trending = [] } = useQuery({
    queryKey: ["search-trending"],
    queryFn: async () => {
      const [m, t] = await Promise.all([discoverMovies({}), discoverTv({})]);
      return [
        ...m.slice(0, 8).map((x) => ({ ...x, _type: "movie" as const })),
        ...t.slice(0, 8).map((x) => ({ ...x, _type: "tv" as const })),
      ];
    },
    staleTime: 1000 * 60 * 30,
  });

  const filtered = useMemo(
    () => results.filter((r) => (filter === "all" ? true : r._bucket === filter)),
    [results, filter],
  );

  const handleSearch = (q: string) => {
    setSearchQuery(q.trim());
    setSearchParams(q.trim() ? { q: q.trim() } : {});
    setSuggestOpen(false);
  };

  const pickSuggestion = (item: any) => {
    const t = item.media_type === "tv" ? "tv" : "movie";
    navigate(t === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`);
    setSuggestOpen(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const showExplore = !searchQuery;

  return (
    <AppLayout>
      <SEO
        title={searchQuery ? `${searchQuery} – Search – BingBloom` : "Explore – BingBloom"}
        description={searchQuery ? `Search results for "${searchQuery}" on BingBloom.` : "Explore movies, TV series, anime and animation on BingBloom."}
      />
      <div className="px-5 pt-4" style={{ background: "#000" }}>
        {/* Search bar */}
        <div ref={wrapRef} className="relative flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1 flex items-center gap-2 rounded-full px-3 py-2" style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Search className="w-3.5 h-3.5 text-white/50" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSuggestOpen(true); }}
              onFocus={() => setSuggestOpen(true)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              placeholder="Search movies, shows, genres..."
              className="flex-1 bg-transparent text-white text-xs placeholder:text-white/50 outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(""); handleSearch(""); }} className="text-[10px] text-white/50 hover:text-white">
                clear
              </button>
            )}
          </div>

          {/* YouTube-style live suggestions */}
          {suggestOpen && liveSuggest.length > 0 && (
            <div
              className="absolute left-9 right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden shadow-2xl"
              style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {liveSuggest.map((s: any) => {
                const t = s.media_type === "tv" ? "tv" : "movie";
                const title = s.title || s.name || "Untitled";
                const date = s.release_date || s.first_air_date || "";
                return (
                  <button
                    key={`${t}-${s.id}`}
                    onClick={() => pickSuggestion(s)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left hover:bg-white/5 border-b border-white/5 last:border-b-0"
                  >
                    <div className="w-9 h-12 rounded overflow-hidden bg-black/50 flex-shrink-0">
                      {s.poster_path && <img src={img(s.poster_path, "w200")} alt="" className="w-full h-full object-cover" loading="lazy" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11.5px] font-semibold text-white truncate">{title}</p>
                      <p className="text-[10px] text-white/50">
                        {t === "tv" ? "Series" : "Movie"}{date ? ` · ${date.slice(0, 4)}` : ""}
                      </p>
                    </div>
                    <Search className="w-3 h-3 text-white/40" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Downloads CTA — opens guidance dialog */}
        <button
          onClick={() => setDownloadsDialog(true)}
          className="w-full mb-4 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-white"
          style={{ background: "rgba(229,9,20,0.12)", border: "1px solid rgba(229,9,20,0.45)" }}
        >
          <Download className="w-3 h-3" />
          Can't find it? Go to Downloads
        </button>

        {showExplore ? (
          <>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "#E50914" }} />
              <h2 className="text-white text-sm font-bold">Top Searches</h2>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5 mb-4">
              {trending.slice(0, 12).map((m: any) => (
                <TmdbCard key={`ts-${m._type}-${m.id}`} item={m} type={m._type} fill />
              ))}
            </div>

            {/* Sponsored Ad — single placement */}
            <div className="-mx-5 mb-3">
              <SponsoredLabel />
              <InlineAdRow count={4} />
            </div>

            <h2 className="text-white text-sm font-bold mb-2">Suggestions for you</h2>
            {isFetching ? (
              <div className="flex items-center justify-center h-28">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#E50914" }} />
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5 mb-4">
                {results.slice(0, 12).map((m) => (
                  <TmdbCard key={`sg-${m._type}-${m.id}`} item={m} type={m._type} fill />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Type filter chips */}
            <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1 rounded-full text-[10.5px] font-medium whitespace-nowrap transition-all ${filter === f.value ? "text-white" : "text-white/60 border border-white/10"}`}
                  style={filter === f.value ? { background: "#E50914" } : { background: "#141414" }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {isFetching ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#E50914" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-white/60 mb-3">No matches for "{searchQuery}".</p>
                <button
                  onClick={() => setNoResultDialog(true)}
                  className="px-4 py-2 rounded-xl text-white font-semibold text-xs"
                  style={{ background: "#E50914" }}
                >
                  Try the Download page →
                </button>
                {trending.length > 0 && (
                  <div className="mt-6 text-left">
                    <h3 className="text-[11px] font-semibold text-white/80 mb-2">You might like</h3>
                    <div className="grid grid-cols-4 gap-1.5">
                      {trending.slice(0, 8).map((m: any) => (
                        <TmdbCard key={`sgg-${m._type}-${m.id}`} item={m} type={m._type} fill />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <p className="text-[10px] text-white/50 mb-2">
                  {filtered.length} result{filtered.length === 1 ? "" : "s"} for "{searchQuery}"
                </p>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5 pb-4">
                  {filtered.map((item, i) => (
                    <Fragment key={`${item._type}-${item.id}`}>
                      <TmdbCard item={item} type={item._type} fill />
                      {(i + 1) % 8 === 0 && i < filtered.length - 1 && (
                        <div className="col-span-4 md:col-span-6 -mx-5 my-1">
                          <SponsoredLabel />
                          <InlineAdRow count={4} />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {downloadsDialog && (
        <div className="fixed inset-0 z-[250] grid place-items-center bg-black/75 p-4" onClick={() => setDownloadsDialog(false)}>
          <div className="w-full max-w-xs rounded-2xl p-5 text-white" style={{ background: "#0f0f10", border: "1px solid rgba(229,9,20,0.4)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4" style={{ color: "#E50914" }} />
              <h3 className="text-sm font-bold">Check Downloads</h3>
            </div>
            <p className="text-[11px] text-white/65 mb-3">
              Open your Downloads tab to see if the movie or show you're looking for is already saved on your device.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDownloadsDialog(false)} className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-white/10">Cancel</button>
              <button onClick={() => { setDownloadsDialog(false); goToDownloads(); }} className="flex-1 px-3 py-2 rounded-lg text-[11px] font-bold text-white" style={{ background: "#E50914" }}>
                Go to Downloads
              </button>
            </div>
          </div>
        </div>
      )}

      {noResultDialog && (
        <div className="fixed inset-0 z-[250] grid place-items-center bg-black/75 p-4" onClick={() => setNoResultDialog(false)}>
          <div className="w-full max-w-xs rounded-2xl p-5 text-white" style={{ background: "#0f0f10", border: "1px solid rgba(229,9,20,0.4)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" style={{ color: "#E50914" }} />
              <h3 className="text-sm font-bold">No results found</h3>
            </div>
            <p className="text-[11px] text-white/65 mb-3">
              We couldn't find "{searchQuery}". Try our external download page.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setNoResultDialog(false)} className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-white/10">Close</button>
              <button onClick={() => { setNoResultDialog(false); goToDownloads(); }} className="flex-1 px-3 py-2 rounded-lg text-[11px] font-bold text-white" style={{ background: "#E50914" }}>
                Go to Downloads
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default SearchPage;
