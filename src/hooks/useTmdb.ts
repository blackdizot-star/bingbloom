import { useQuery } from "@tanstack/react-query";
import {
  Trending, Movies, TV, Animation, Documentary,
  movieDetail, tvDetail, tvSeason,
  movieRecommendations, movieSimilar, tvRecommendations, tvSimilar,
  TmdbItem,
} from "@/lib/tmdb";

const opts = { staleTime: 1000 * 60 * 30, gcTime: 1000 * 60 * 60 * 6 };

export const useTrendingMovies = () => useQuery({ queryKey: ["tmdb", "trending", "movie"], queryFn: Trending.moviesWeek, ...opts });
export const useTrendingTv = () => useQuery({ queryKey: ["tmdb", "trending", "tv"], queryFn: Trending.tvWeek, ...opts });
export const useTrendingAll = () => useQuery({ queryKey: ["tmdb", "trending", "all"], queryFn: Trending.allDay, ...opts });
export const usePopularMovies = () => useQuery({ queryKey: ["tmdb", "movie", "popular"], queryFn: Movies.popular, ...opts });
export const useTopRatedMovies = () => useQuery({ queryKey: ["tmdb", "movie", "topRated"], queryFn: Movies.topRated, ...opts });
export const useUpcomingMovies = () => useQuery({ queryKey: ["tmdb", "movie", "upcoming"], queryFn: Movies.upcoming, ...opts });
export const useNowPlayingMovies = () => useQuery({ queryKey: ["tmdb", "movie", "nowPlaying"], queryFn: Movies.nowPlaying, ...opts });
export const useMoviesByGenre = (genreId: number) =>
  useQuery({ queryKey: ["tmdb", "movie", "genre", genreId], queryFn: () => Movies.byGenre(genreId), ...opts });
export const usePopularTv = () => useQuery({ queryKey: ["tmdb", "tv", "popular"], queryFn: TV.popular, ...opts });
export const useTopRatedTv = () => useQuery({ queryKey: ["tmdb", "tv", "topRated"], queryFn: TV.topRated, ...opts });
export const useAiringTodayTv = () => useQuery({ queryKey: ["tmdb", "tv", "airingToday"], queryFn: TV.airingToday, ...opts });
export const useOnAirTv = () => useQuery({ queryKey: ["tmdb", "tv", "onAir"], queryFn: TV.onAir, ...opts });

// Animation / Documentary buckets
export const useAnimationMovies = () => useQuery({ queryKey: ["tmdb", "animation", "movies"], queryFn: Animation.movies, ...opts });
export const useAnimationTv = () => useQuery({ queryKey: ["tmdb", "animation", "tv"], queryFn: Animation.tv, ...opts });
export const useAnimationTopRated = () => useQuery({ queryKey: ["tmdb", "animation", "top"], queryFn: Animation.topRated, ...opts });
export const useDocumentaryMovies = () => useQuery({ queryKey: ["tmdb", "documentary", "movies"], queryFn: Documentary.movies, ...opts });
export const useDocumentaryTv = () => useQuery({ queryKey: ["tmdb", "documentary", "tv"], queryFn: Documentary.tv, ...opts });
export const useDocumentaryTopRated = () => useQuery({ queryKey: ["tmdb", "documentary", "top"], queryFn: Documentary.topRated, ...opts });

export const useMovieDetail = (id?: string) =>
  useQuery({ queryKey: ["tmdb", "movie", "detail", id], queryFn: () => movieDetail(id!), enabled: !!id, ...opts });
export const useTvDetail = (id?: string) =>
  useQuery({ queryKey: ["tmdb", "tv", "detail", id], queryFn: () => tvDetail(id!), enabled: !!id, ...opts });
export const useTvSeason = (id?: string, season?: number) =>
  useQuery({ queryKey: ["tmdb", "tv", "season", id, season], queryFn: () => tvSeason(id!, season!), enabled: !!id && !!season, ...opts });

// Recommendations / similar
export const useMovieRecommendations = (id?: string) =>
  useQuery({ queryKey: ["tmdb", "movie", "rec", id], queryFn: () => movieRecommendations(id!), enabled: !!id, ...opts });
export const useMovieSimilar = (id?: string) =>
  useQuery({ queryKey: ["tmdb", "movie", "sim", id], queryFn: () => movieSimilar(id!), enabled: !!id, ...opts });
export const useTvRecommendations = (id?: string) =>
  useQuery({ queryKey: ["tmdb", "tv", "rec", id], queryFn: () => tvRecommendations(id!), enabled: !!id, ...opts });
export const useTvSimilar = (id?: string) =>
  useQuery({ queryKey: ["tmdb", "tv", "sim", id], queryFn: () => tvSimilar(id!), enabled: !!id, ...opts });

export type { TmdbItem };
