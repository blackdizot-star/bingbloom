import { useQuery } from "@tanstack/react-query";
import { tmdb, fetchList, type TmdbItem } from "@/lib/tmdb";

// TMDB-driven anime hooks. Anime ≈ Animation genre (16) + Japanese origin.
const animeDiscover = (extra: Record<string, string> = {}) => {
  const qs = new URLSearchParams({
    sort_by: "popularity.desc",
    with_genres: "16",
    with_original_language: "ja",
    include_adult: "false",
    ...extra,
  });
  return fetchList(`/discover/tv?${qs.toString()}`, "tv");
};

export const useTrendingAnime = () =>
  useQuery({
    queryKey: ["anime", "trending"],
    queryFn: () => animeDiscover({ "first_air_date.gte": "2024-01-01" }),
    staleTime: 1000 * 60 * 30,
  });

export const usePopularAnime = () =>
  useQuery({
    queryKey: ["anime", "popular"],
    queryFn: () => animeDiscover(),
    staleTime: 1000 * 60 * 30,
  });

export const useTopRatedAnime = () =>
  useQuery({
    queryKey: ["anime", "topRated"],
    queryFn: () => animeDiscover({ sort_by: "vote_average.desc", "vote_count.gte": "100" }),
    staleTime: 1000 * 60 * 30,
  });

// Map common genre labels → TMDB tv genre ids (kept simple).
const TV_GENRE = {
  Action: 10759,
  Romance: 10749,
  Fantasy: 10765, // Sci-Fi & Fantasy on TV
  Comedy: 35,
  Drama: 18,
  Mystery: 9648,
};

export const useAnimeByGenre = (label: keyof typeof TV_GENRE) =>
  useQuery({
    queryKey: ["anime", "genre", label],
    queryFn: () => animeDiscover({ with_genres: `16,${TV_GENRE[label]}` }),
    staleTime: 1000 * 60 * 30,
  });

export const useAnimeSearch = (query: string) =>
  useQuery({
    queryKey: ["anime", "search", query],
    queryFn: () =>
      fetchList(
        `/search/tv?query=${encodeURIComponent(query)}&include_adult=false&with_genres=16`,
        "tv",
      ),
    enabled: query.length > 0,
  });

export type AnimeItem = TmdbItem;
