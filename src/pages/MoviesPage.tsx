import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import TmdbRow from "@/components/TmdbRow";
import InlineAdRow from "@/components/InlineAdRow";
import ResponsiveScriptAd from "@/components/ResponsiveScriptAd";
import {
  useTrendingMovies,
  usePopularMovies,
  useTopRatedMovies,
  useUpcomingMovies,
  useNowPlayingMovies,
  useMoviesByGenre,
} from "@/hooks/useTmdb";
import { GENRES } from "@/lib/tmdb";

const MoviesPage = () => {
  const trending = useTrendingMovies();
  const popular = usePopularMovies();
  const topRated = useTopRatedMovies();
  const upcoming = useUpcomingMovies();
  const nowPlaying = useNowPlayingMovies();
  const action = useMoviesByGenre(GENRES.action);
  const adventure = useMoviesByGenre(GENRES.adventure);
  const drama = useMoviesByGenre(GENRES.drama);
  const comedy = useMoviesByGenre(GENRES.comedy);
  const scifi = useMoviesByGenre(GENRES.scifi);
  const horror = useMoviesByGenre(GENRES.horror);
  const animation = useMoviesByGenre(GENRES.animation);
  const family = useMoviesByGenre(GENRES.family);
  const thriller = useMoviesByGenre(GENRES.thriller);
  const romance = useMoviesByGenre(GENRES.romance);
  const fantasy = useMoviesByGenre(GENRES.fantasy);
  const crime = useMoviesByGenre(GENRES.crime);

  return (
    <AppLayout>
      <SEO
        title="Movies – MovieNoir"
        description="Browse trending, top-rated, now playing and upcoming movies across every genre. Stream full HD movies free on MovieNoir."
        jsonLd={{
          "@type": "CollectionPage",
          name: "Movies – MovieNoir",
          description: "Browse trending, top-rated, now playing and upcoming movies across every genre.",
          url: "https://bingbloom.lovable.app/movies",
        }}
      />
      <ResponsiveScriptAd className="border-b border-border/40 bg-background" />
      <div className="px-[4%] pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Movies</h1>
        <p className="text-sm text-muted-foreground mt-1">Discover trending, top-rated and upcoming films</p>
      </div>

      <InlineAdRow count={4} />

      <TmdbRow title="Trending This Week" items={trending.data} isLoading={trending.isLoading} type="movie" />
      <TmdbRow title="Now Playing in Theaters" items={nowPlaying.data} isLoading={nowPlaying.isLoading} type="movie" />
      <TmdbRow title="Upcoming Releases" items={upcoming.data} isLoading={upcoming.isLoading} type="movie" />
      <InlineAdRow />
      <TmdbRow title="Top Rated of All Time" items={topRated.data} isLoading={topRated.isLoading} type="movie" ranked />
      <TmdbRow title="Popular Right Now" items={popular.data} isLoading={popular.isLoading} type="movie" />
      <TmdbRow title="Action & Adventure" items={action.data} isLoading={action.isLoading} type="movie" />
      <TmdbRow title="Adventure" items={adventure.data} isLoading={adventure.isLoading} type="movie" />
      <TmdbRow title="Sci-Fi" items={scifi.data} isLoading={scifi.isLoading} type="movie" />
      <InlineAdRow />
      <TmdbRow title="Drama" items={drama.data} isLoading={drama.isLoading} type="movie" />
      <TmdbRow title="Comedy" items={comedy.data} isLoading={comedy.isLoading} type="movie" />
      <TmdbRow title="Horror" items={horror.data} isLoading={horror.isLoading} type="movie" />
      <TmdbRow title="Thriller" items={thriller.data} isLoading={thriller.isLoading} type="movie" />
      <TmdbRow title="Romance" items={romance.data} isLoading={romance.isLoading} type="movie" />
      <InlineAdRow />
      <TmdbRow title="Fantasy" items={fantasy.data} isLoading={fantasy.isLoading} type="movie" />
      <TmdbRow title="Crime" items={crime.data} isLoading={crime.isLoading} type="movie" />
      <TmdbRow title="Animation" items={animation.data} isLoading={animation.isLoading} type="movie" />
      <TmdbRow title="Family" items={family.data} isLoading={family.isLoading} type="movie" />
    </AppLayout>
  );
};

export default MoviesPage;
