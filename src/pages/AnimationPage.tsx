import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import TmdbRow from "@/components/TmdbRow";
import {
  useAnimationMovies,
  useAnimationTv,
  useAnimationTopRated,
} from "@/hooks/useTmdb";

const AnimationPage = () => {
  const movies = useAnimationMovies();
  const tv = useAnimationTv();
  const top = useAnimationTopRated();

  return (
    <AppLayout>
      <SEO
        title="Animation – MovieNoir"
        description="Animated movies and series for every age. Stream Pixar, anime classics, family animation and adult animated shows on MovieNoir."
      />
      <div className="px-[4%] pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Animation</h1>
        <p className="text-sm text-muted-foreground mt-1">Animated movies and series for every age</p>
      </div>
      <TmdbRow title="Trending Animated Movies" items={movies.data} isLoading={movies.isLoading} type="movie" />
      <TmdbRow title="Animated Series" items={tv.data} isLoading={tv.isLoading} type="tv" />
      <TmdbRow title="Top Rated Animation" items={top.data} isLoading={top.isLoading} type="movie" />
    </AppLayout>
  );
};

export default AnimationPage;
