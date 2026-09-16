import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, Loader2, Flame, Star, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";

import NativeAd from "@/components/NativeAd";
import ResponsiveScriptAd from "@/components/ResponsiveScriptAd";

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

const SkeletonRow = () => (
  <div
    className="w-full flex items-center gap-3 p-2 rounded-xl animate-pulse"
    style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)" }}
  >
    <div className="w-[58px] h-[82px] rounded-lg bg-white/5 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-3/4 rounded bg-white/10" />
      <div className="h-2.5 w-1/3 rounded bg-white/10" />
      <div className="h-2.5 w-1/4 rounded bg-white/10" />
    </div>
  </div>
);

const BrandedLoadingState = ({ label = "Loading…" }: { label?: string }) => (
  <div className="space-y-2 pb-4">
    <div className="flex flex-col items-center justify-center gap-2 py-4">
      <img src="/logo-compact.png" alt="MovieNoir" className="h-12 w-12 animate-pulse rounded-xl" />
      <p className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-semibold">{label}</p>
    </div>
    {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
  </div>
);


const useDebounced = <T,>(value: T, delay = 250) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const ResultRow = ({ item, onClick }: { item: ResultItem; onClick: () => void }) => {
  const title = (item as any).title || (item as any).name || "Untitled";
  const date = (item as any).release_date || (item as any).first_air_date || "";
  const poster = item.poster_path || item.backdrop_path;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/5 transition-colors"
      style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="relative w-[58px] h-[82px] rounded-lg overflow-hidden bg-black flex-shrink-0">
        {poster ? (
          <img src={img(poster, "w200")} alt={title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-white/25 text-[9px]">No art</div>
        )}
        <span className="absolute bottom-1 right-1 grid place-items-center w-5 h-5 rounded-full bg-[#FF2D8F]">
          <Play className="w-2.5 h-2.5 text-white fill-white" />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-bold text-white truncate">{title}</h3>
        <p className="text-[10.5px] text-white/55 mt-0.5">
          {item._type === "tv" ? "Series" : "Movie"}{date ? ` · ${date.slice(0, 4)}` : ""}
        </p>
        {!!item.vote_average && (
          <p className="text-[10.5px] text-amber-400 mt-0.5 flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400" /> {item.vote_average.toFixed(1)}
          </p>
        )}
        {item.overview && (
          <p className="text-[10px] text-white/40 mt-1 line-clamp-2">{item.overview}</p>
        )}
      </div>
    </button>
  );
};

const ExploreCard = ({ item, onClick }: { item: ResultItem; onClick: () => void }) => {
  const title = (item as any).title || (item as any).name || "Untitled";
  const date = (item as any).release_date || (item as any).first_air_date || "";
  const poster = item.poster_path || item.backdrop_path;
  return (
    <button
      onClick={onClick}
      className="min-w-0 overflow-hidden rounded-md border border-border bg-card text-left transition-transform hover:scale-[1.02]"
    >
      <div className="relative w-full aspect-[2/3] bg-black">
        {poster ? (
          <img src={img(poster, "w300")} alt={title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-white/25 text-[9px]">No art</div>
        )}
        <span className="absolute bottom-1 right-1 grid h-4 w-4 place-items-center rounded-full bg-primary sm:h-5 sm:w-5">
          <Play className="h-2 w-2 fill-primary-foreground text-primary-foreground sm:h-2.5 sm:w-2.5" />
        </span>
        {!!item.vote_average && (
          <span className="absolute top-1 left-1 flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/70 text-[9px] font-semibold text-amber-400">
            <Star className="w-2.5 h-2.5 fill-amber-400" /> {item.vote_average.toFixed(1)}
          </span>
        )}
      </div>
      <div className="p-1 sm:p-1.5">
        <h3 className="line-clamp-1 text-[8px] font-bold leading-tight text-foreground sm:text-[11px]">{title}</h3>
        <p className="mt-0.5 line-clamp-1 text-[7px] text-muted-foreground sm:text-[9.5px]">
          {item._type === "tv" ? "Series" : "Movie"}{date ? ` · ${date.slice(0, 4)}` : ""}
        </p>
      </div>
    </button>
  );
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounced(query, 220);

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
    const nextQuery = q.trim();
    setSearchQuery(nextQuery);
    navigate(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : "/search", { replace: true });
    setSuggestOpen(false);
  };

  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setQuery(urlQuery);
    setSearchQuery(urlQuery);
  }, [searchParams]);

  const openItem = (item: ResultItem) =>
    navigate(item._type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`);

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
        title={searchQuery ? `${searchQuery} – Search – MovieNoir` : "Explore – MovieNoir"}
        description={searchQuery ? `Search results for "${searchQuery}" on MovieNoir.` : "Explore movies, TV series, anime and animation on MovieNoir."}
      />
      <ResponsiveScriptAd className="border-b border-border/40 bg-background" />
      <div className="bg-background px-3 pt-3 sm:px-5 sm:pt-4">
        {/* Search bar */}
        <div ref={wrapRef} className="relative flex items-center gap-2 mb-4">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <form className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-3 py-2" onSubmit={(event) => { event.preventDefault(); handleSearch(query); }}>
            <Search className="w-3.5 h-3.5 text-white/50" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSuggestOpen(true); }}
              onFocus={() => setSuggestOpen(true)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                handleSearch(event.currentTarget.value);
              }}
              placeholder="Search movies, shows, genres..."
              className="flex-1 bg-transparent text-white text-xs placeholder:text-white/50 outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(""); handleSearch(""); }} className="text-[10px] text-white/50 hover:text-white">
                clear
              </button>
            )}
            <button type="submit" aria-label="Search" className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Search className="h-3 w-3" />
            </button>
          </form>

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

        {showExplore ? (
          <>
            <div className="flex items-center gap-1.5 mb-3">
              <Flame className="w-4 h-4 fill-[#FF2D8F]" style={{ color: "#FF2D8F" }} />
              <h2 className="text-white text-sm font-bold">Trending now</h2>
            </div>
            {isFetching && results.length === 0 ? (
              <BrandedLoadingState label="Loading trending" />
            ) : (
              <>
                <div className="grid grid-cols-4 gap-1.5 pb-4 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6">
                  {(results as ResultItem[]).slice(0, 24).map((m, i) => (
                    <div key={`sg-${m._type}-${m.id}`} className="contents">
                      <ExploreCard item={m} onClick={() => openItem(m)} />
                      {(i + 1) % 8 === 0 && i < 23 && (
                        <div className="col-span-4 -mx-3 my-1 sm:-mx-5 md:col-span-5 lg:col-span-6">
                          <SponsoredLabel />
                          <NativeAd compact height={110} desktopHeight={160} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
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
                  style={filter === f.value ? { background: "#FF2D8F" } : { background: "#141414" }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {isFetching ? (
              <BrandedLoadingState label="Searching" />
            ) : filtered.length === 0 ? (
              <div className="py-8 flex flex-col items-center text-center">
                <img src="/logo-compact.png" alt="" className="h-14 w-14 mb-3 rounded-xl opacity-90" />
                <p className="text-sm font-semibold text-white">No results found</p>
                <p className="text-xs text-white/55 mt-1 mb-5">Nothing matches "{searchQuery}". Try another title.</p>
                {trending.length > 0 && (
                  <div className="text-left w-full">
                    <h3 className="text-[11px] font-semibold text-white/80 mb-2">You might like</h3>
                    <div className="space-y-2">
                      {(trending as any[]).slice(0, 8).map((m: any) => (
                        <ResultRow
                          key={`sgg-${m._type}-${m.id}`}
                          item={{ ...m, _bucket: "all" }}
                          onClick={() => navigate(m._type === "tv" ? `/tv/${m.id}` : `/movie/${m.id}`)}
                        />
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
                <div className="grid grid-cols-4 gap-1.5 pb-4 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6">
                  {filtered.map((item, i) => (
                    <div key={`${item._type}-${item.id}`} className="contents">
                      <ExploreCard item={item} onClick={() => openItem(item)} />
                      {(i + 1) % 8 === 0 && i < filtered.length - 1 && (
                        <div className="col-span-4 -mx-3 my-1 sm:-mx-5 md:col-span-5 lg:col-span-6">
                          <SponsoredLabel />
                          <NativeAd compact height={110} desktopHeight={160} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default SearchPage;
