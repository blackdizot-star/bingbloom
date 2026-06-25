import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import TmdbRow from "@/components/TmdbRow";
import {
  useDocumentaryMovies,
  useDocumentaryTv,
  useDocumentaryTopRated,
} from "@/hooks/useTmdb";

const DocumentaryPage = () => {
  const movies = useDocumentaryMovies();
  const tv = useDocumentaryTv();
  const top = useDocumentaryTopRated();

  return (
    <AppLayout>
      <SEO
        title="Documentaries – BingBloom"
        description="Real stories, real people. Explore the world with trending and top-rated documentaries and docuseries streaming on BingBloom."
      />
      <div className="px-[4%] pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Documentary</h1>
        <p className="text-sm text-muted-foreground mt-1">Real stories, real people — explore the world</p>
      </div>
      <TmdbRow title="Trending Documentaries" items={movies.data} isLoading={movies.isLoading} type="movie" />
      <TmdbRow title="Documentary Series" items={tv.data} isLoading={tv.isLoading} type="tv" />
      <TmdbRow title="Top Rated" items={top.data} isLoading={top.isLoading} type="movie" />
    </AppLayout>
  );
};

export default DocumentaryPage;
