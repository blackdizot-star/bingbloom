// Local-first data layer.
//
// The app ships three static JSON bundles generated from the exported Supabase
// tables (see scripts/build-local-data.py):
//   /data/tmdb-cache.json  – cached TMDB API responses keyed by endpoint
//   /data/catalog.json     – the movie/TV catalog (TMDB metadata)
//   /data/streams.json     – direct MP4 stream links per title / episode
//
// Everything is fetched once, cached in memory, and served without touching
// Supabase. Network calls are only used as a last-resort fallback.

export interface CatalogItem {
  id: number;
  media_type: "movie" | "tv";
  title: string;
  original_title: string | null;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string | null;
  first_air_date: string | null;
  genre_ids: number[];
  runtime: number | null;
  original_language: string | null;
  number_of_seasons: number | null;
  number_of_episodes: number | null;
  tagline: string | null;
}

export interface LocalStream {
  u: string;
  r: number;
  s: string | null;
  src: string;
}

const BASE = `${import.meta.env.BASE_URL || "/"}data`.replace(/\/+$/, "");

function loader<T>(file: string, fallback: T) {
  let promise: Promise<T> | null = null;
  let value: T | null = null;
  const load = () => {
    if (!promise) {
      promise = fetch(`${BASE}/${file}`)
        .then((r) => (r.ok ? r.json() : fallback))
        .then((d: T) => {
          value = d;
          return d;
        })
        .catch(() => fallback);
    }
    return promise;
  };
  return { load, peek: () => value };
}

const cacheStore = loader<Record<string, any>>("tmdb-cache.json", {});
const catalogStore = loader<CatalogItem[]>("catalog.json", []);
const streamStore = loader<Record<string, LocalStream[]>>("streams.json", {});

export const preloadLocalData = () => {
  cacheStore.load();
  catalogStore.load();
  streamStore.load();
};

/** Normalize a TMDB path + params into the cache key format. */
export function cacheKey(path: string, params: Record<string, string | number> = {}) {
  const [rawPath, inlineQs] = (path.startsWith("/") ? path : `/${path}`).split("?");
  const sp = new URLSearchParams(inlineQs || "");
  Object.entries(params).forEach(([k, v]) => sp.set(k, String(v)));
  sp.delete("language");
  sp.delete("api_key");
  const entries = [...sp.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const qs = entries.map(([k, v]) => `${k}=${v}`).join("&");
  return rawPath + (qs ? `?${qs}` : "");
}

/** Cached TMDB response for a path, or null when not bundled. */
export async function localTmdb<T = any>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T | null> {
  const cache = await cacheStore.load();
  return (cache[cacheKey(path, params)] as T) ?? null;
}

export const getCatalog = () => catalogStore.load();

export async function catalogItem(id: string | number, type?: "movie" | "tv") {
  const list = await catalogStore.load();
  const n = Number(id);
  return list.find((c) => c.id === n && (!type || c.media_type === type)) || null;
}

const streamKey = (
  tmdbId: string | number,
  type: "movie" | "tv",
  season?: number,
  episode?: number,
) => (type === "tv" ? `tv:${tmdbId}:${season ?? 1}:${episode ?? 1}` : `movie:${tmdbId}`);

/** Bundled stream links (highest quality first) for a title or episode. */
export async function getLocalStreams(
  tmdbId: string | number,
  type: "movie" | "tv",
  season?: number,
  episode?: number,
): Promise<LocalStream[]> {
  const map = await streamStore.load();
  return map[streamKey(tmdbId, type, season, episode)] || [];
}
