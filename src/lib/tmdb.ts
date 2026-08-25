// Centralized TMDB API client. Reads the bundled local TMDB cache first, then
// falls back to the `tmdb-proxy` edge function. Returns normalized shapes.
import { localTmdb, getCatalog } from "@/lib/localData";


const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const PROXY_BASE = `https://${PROJECT_REF}.supabase.co/functions/v1/tmdb-proxy`;

/** Official TMDB v3 API key — direct reads, no backend needed. */
export const TMDB_API_KEY = "166a2e4d2ced5762795a715ff393d39a";
const TMDB_BASE = "https://api.themoviedb.org/3";

export const TMDB_IMG = "https://image.tmdb.org/t/p";

export const img = (path: string | null | undefined, size: "w200" | "w300" | "w500" | "w780" | "original" = "w500") =>
  path ? `${TMDB_IMG}/${size}${path}` : "";

export interface TmdbItem {
  id: number;
  title: string;
  original_title?: string;
  original_language?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  media_type?: "movie" | "tv";
}

export interface TmdbList {
  page: number;
  results: TmdbItem[];
  total_pages: number;
}

const normalize = (raw: any, fallbackType?: "movie" | "tv"): TmdbItem => ({
  id: raw.id,
  title: raw.title || raw.name || "Untitled",
  original_title: raw.original_title || raw.original_name,
  original_language: raw.original_language,
  poster_path: raw.poster_path,
  backdrop_path: raw.backdrop_path,
  overview: raw.overview || "",
  vote_average: raw.vote_average || 0,
  release_date: raw.release_date,
  first_air_date: raw.first_air_date,
  genre_ids: raw.genre_ids,
  media_type: raw.media_type || fallbackType,
});

export async function tmdb<T = any>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  // Local-first: bundled TMDB cache (no Supabase call needed).
  const cached = await localTmdb<T>(path, params);
  if (cached) return cached;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const search = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  );
  const qs = search.toString();

  // Direct TMDB read with the official API key.
  try {
    const direct = new URLSearchParams(search);
    direct.set("api_key", TMDB_API_KEY);
    const res = await fetch(`${TMDB_BASE}${normalized}?${direct.toString()}`);
    if (res.ok) return res.json();
  } catch {
    /* fall through to the proxy */
  }

  const url = `${PROXY_BASE}${normalized}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export async function fetchList(path: string, fallbackType?: "movie" | "tv"): Promise<TmdbItem[]> {
  try {
    const data = await tmdb<TmdbList>(path);
    const list = (data.results || []).map(r => normalize(r, fallbackType));
    if (list.length) return list;
  } catch {
    /* fall through to the bundled catalog */
  }
  return localCatalogList(path, fallbackType);
}

/** Offline/no-cache fallback: derive a list from the bundled catalog. */
async function localCatalogList(path: string, fallbackType?: "movie" | "tv"): Promise<TmdbItem[]> {
  const catalog = await getCatalog();
  const genreMatch = /with_genres=(\d+)/.exec(path);
  const type: "movie" | "tv" | undefined =
    fallbackType || (path.includes("/tv") ? "tv" : path.includes("/movie") ? "movie" : undefined);
  let list = catalog.filter(c => (type ? c.media_type === type : true));
  if (genreMatch) {
    const g = Number(genreMatch[1]);
    list = list.filter(c => c.genre_ids?.includes(g));
  }
  const sorted = list
    .slice()
    .sort((a, b) => (path.includes("top_rated") || path.includes("vote_average")
      ? b.vote_average - a.vote_average
      : String(b.release_date || b.first_air_date || "").localeCompare(
          String(a.release_date || a.first_air_date || ""),
        )));
  return sorted.slice(0, 20).map(c => normalize(c, type));
}

// Endpoint shortcuts
export const Trending = {
  moviesWeek: () => fetchList("/trending/movie/week", "movie"),
  tvWeek: () => fetchList("/trending/tv/week", "tv"),
  allDay: () => fetchList("/trending/all/day"),
};
export const Movies = {
  popular: () => fetchList("/movie/popular", "movie"),
  topRated: () => fetchList("/movie/top_rated", "movie"),
  upcoming: () => fetchList("/movie/upcoming", "movie"),
  nowPlaying: () => fetchList("/movie/now_playing", "movie"),
  byGenre: (genreId: number) => fetchList(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`, "movie"),
};
export const TV = {
  popular: () => fetchList("/tv/popular", "tv"),
  topRated: () => fetchList("/tv/top_rated", "tv"),
  airingToday: () => fetchList("/tv/airing_today", "tv"),
  onAir: () => fetchList("/tv/on_the_air", "tv"),
  byGenre: (genreId: number) => fetchList(`/discover/tv?with_genres=${genreId}&sort_by=popularity.desc`, "tv"),
};

// Animation (movies + TV) and Documentary (movies + TV)
export const Animation = {
  movies: () => fetchList(`/discover/movie?with_genres=16&sort_by=popularity.desc`, "movie"),
  tv: () => fetchList(`/discover/tv?with_genres=16&sort_by=popularity.desc&without_original_language=ja`, "tv"),
  topRated: () => fetchList(`/discover/movie?with_genres=16&sort_by=vote_average.desc&vote_count.gte=200`, "movie"),
};
export const Documentary = {
  movies: () => fetchList(`/discover/movie?with_genres=99&sort_by=popularity.desc`, "movie"),
  tv: () => fetchList(`/discover/tv?with_genres=99&sort_by=popularity.desc`, "tv"),
  topRated: () => fetchList(`/discover/movie?with_genres=99&sort_by=vote_average.desc&vote_count.gte=100`, "movie"),
};

// Detail fetchers
export const movieDetail = (id: string | number) =>
  tmdb<any>(`/movie/${id}`, { append_to_response: "credits,reviews,videos,recommendations,similar" });
export const tvDetail = (id: string | number) =>
  tmdb<any>(`/tv/${id}`, { append_to_response: "credits,reviews,videos,recommendations,similar" });
export const tvSeason = (id: string | number, season: number) =>
  tmdb<any>(`/tv/${id}/season/${season}`);

// Trailers feed for the TikTok-style Shorts page
export async function fetchTrendingTrailers(limit = 15): Promise<{ item: TmdbItem; key: string }[]> {
  const trending = await Trending.allDay();
  const top = trending.slice(0, limit * 2);
  const enriched = await Promise.all(
    top.map(async (m) => {
      try {
        const path = (m.media_type || "movie") === "tv" ? `/tv/${m.id}/videos` : `/movie/${m.id}/videos`;
        const v = await tmdb<any>(path);
        const list = v.results || [];
        const trailer =
          list.find((r: any) => r.type === "Trailer" && r.site === "YouTube") ||
          list.find((r: any) => r.type === "Teaser" && r.site === "YouTube") ||
          list.find((r: any) => r.site === "YouTube");
        return trailer ? { item: m, key: trailer.key as string } : null;
      } catch {
        return null;
      }
    }),
  );
  return enriched.filter(Boolean).slice(0, limit) as { item: TmdbItem; key: string }[];
}

// Recommendations / similar (separated endpoints, lighter payload)
export const movieRecommendations = (id: string | number) =>
  fetchList(`/movie/${id}/recommendations`, "movie");
export const movieSimilar = (id: string | number) =>
  fetchList(`/movie/${id}/similar`, "movie");
export const tvRecommendations = (id: string | number) =>
  fetchList(`/tv/${id}/recommendations`, "tv");
export const tvSimilar = (id: string | number) =>
  fetchList(`/tv/${id}/similar`, "tv");

// Search & discover
export const searchMulti = (query: string) =>
  fetchList(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false`);
export const searchMovies = (query: string, year?: number) =>
  fetchList(
    `/search/movie?query=${encodeURIComponent(query)}&include_adult=false${year ? `&year=${year}` : ""}`,
    "movie",
  );
export const searchTv = (query: string, year?: number) =>
  fetchList(
    `/search/tv?query=${encodeURIComponent(query)}&include_adult=false${year ? `&first_air_date_year=${year}` : ""}`,
    "tv",
  );
export const discoverMovies = (params: { genreId?: number; year?: number } = {}) => {
  const qs = new URLSearchParams({ sort_by: "popularity.desc", include_adult: "false" });
  if (params.genreId) qs.set("with_genres", String(params.genreId));
  if (params.year) qs.set("primary_release_year", String(params.year));
  return fetchList(`/discover/movie?${qs.toString()}`, "movie");
};
export const discoverTv = (params: { genreId?: number; year?: number } = {}) => {
  const qs = new URLSearchParams({ sort_by: "popularity.desc", include_adult: "false" });
  if (params.genreId) qs.set("with_genres", String(params.genreId));
  if (params.year) qs.set("first_air_date_year", String(params.year));
  return fetchList(`/discover/tv?${qs.toString()}`, "tv");
};

// Common genre ids (movie). TV uses partly different ids but action/drama/comedy overlap.
export const GENRES = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  drama: 18,
  family: 10751,
  fantasy: 14,
  horror: 27,
  romance: 10749,
  scifi: 878,
  thriller: 53,
};

export const GENRE_OPTIONS = [
  { label: "Any genre", value: 0 },
  { label: "Action", value: GENRES.action },
  { label: "Adventure", value: GENRES.adventure },
  { label: "Animation", value: GENRES.animation },
  { label: "Comedy", value: GENRES.comedy },
  { label: "Crime", value: GENRES.crime },
  { label: "Drama", value: GENRES.drama },
  { label: "Family", value: GENRES.family },
  { label: "Fantasy", value: GENRES.fantasy },
  { label: "Horror", value: GENRES.horror },
  { label: "Romance", value: GENRES.romance },
  { label: "Sci-Fi", value: GENRES.scifi },
  { label: "Thriller", value: GENRES.thriller },
];

