import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import TmdbRow from "@/components/TmdbRow";
import InlineAdRow from "@/components/InlineAdRow";
import { fetchList, type TmdbItem } from "@/lib/tmdb";

// 20 anime category rows powered by TMDB discover (genre 16 + Japanese origin + keywords).
const ROWS: { title: string; params: Record<string, string> }[] = [
  { title: "Trending Anime", params: { sort_by: "popularity.desc" } },
  { title: "Top Rated", params: { sort_by: "vote_average.desc", "vote_count.gte": "200" } },
  { title: "New Releases", params: { sort_by: "first_air_date.desc", "first_air_date.lte": new Date().toISOString().slice(0, 10) } },
  { title: "Action & Adventure", params: { with_genres: "16,10759" } },
  { title: "Romance", params: { with_genres: "16,10749" } },
  { title: "Fantasy", params: { with_genres: "16,10765" } },
  { title: "Comedy", params: { with_genres: "16,35" } },
  { title: "Drama", params: { with_genres: "16,18" } },
  { title: "Mystery", params: { with_genres: "16,9648" } },
  { title: "Sci-Fi", params: { with_genres: "16,10765" } },
  { title: "Slice of Life", params: { with_keywords: "210024" } },
  { title: "Supernatural", params: { with_keywords: "6152" } },
  { title: "Mecha", params: { with_keywords: "4344" } },
  { title: "Isekai", params: { with_keywords: "246716" } },
  { title: "Magic", params: { with_keywords: "2343" } },
  { title: "School Life", params: { with_keywords: "6270" } },
  { title: "Music", params: { with_genres: "16,10402" } },
  { title: "Kids & Family", params: { with_genres: "16,10762" } },
  { title: "Martial Arts", params: { with_keywords: "5565" } },
  { title: "Cyberpunk", params: { with_keywords: "12190" } },
];

function useAnimeRow(title: string, params: Record<string, string>) {
  return useQuery<TmdbItem[]>({
    queryKey: ["anime", "row", title],
    queryFn: () => {
      const qs = new URLSearchParams({
        sort_by: "popularity.desc",
        with_genres: "16",
        with_original_language: "ja",
        include_adult: "false",
        ...params,
      });
      return fetchList(`/discover/tv?${qs.toString()}`, "tv");
    },
    staleTime: 1000 * 60 * 30,
  });
}

const AnimeRow = ({ title, params }: { title: string; params: Record<string, string> }) => {
  const { data, isLoading } = useAnimeRow(title, params);
  return <TmdbRow title={title} items={data} isLoading={isLoading} type="tv" />;
};

const AnimePage = () => (
  <AppLayout>
    <SEO
      title="Anime – BingBloom"
      description="20+ anime collections — trending, top-rated, isekai, mecha, romance, slice of life and more. Stream anime free."
    />
    <div className="px-[4%] pt-6 pb-2">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">Anime</h1>
      <p className="text-sm text-muted-foreground mt-1">20 hand-picked collections</p>
    </div>
    {ROWS.map((r, i) => (
      <div key={r.title}>
        <AnimeRow title={r.title} params={r.params} />
        {(i === 3 || i === 9 || i === 15) && <InlineAdRow />}
      </div>
    ))}
  </AppLayout>
);

export default AnimePage;
