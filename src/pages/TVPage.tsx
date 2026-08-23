import { Link } from "react-router-dom";
import { Radio, ChevronRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import TmdbRow from "@/components/TmdbRow";
import {
  useTrendingTv,
  usePopularTv,
  useTopRatedTv,
  useAiringTodayTv,
  useOnAirTv,
} from "@/hooks/useTmdb";

const TVPage = () => {
  const trending = useTrendingTv();
  const popular = usePopularTv();
  const topRated = useTopRatedTv();
  const airing = useAiringTodayTv();
  const onAir = useOnAirTv();

  return (
    <AppLayout>
      <SEO
        title="TV Shows – MovieNoir"
        description="Stream trending TV series, on-air shows, top-rated dramas and live channels from around the world on MovieNoir."
        jsonLd={{
          "@type": "CollectionPage",
          name: "TV Shows – MovieNoir",
          description: "Stream trending TV series, on-air shows, top-rated dramas and live channels from around the world.",
          url: "https://bingbloom.lovable.app/tv",
        }}
      />
      <div className="px-[4%] pt-6 pb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">TV Shows</h1>
          <p className="text-sm text-muted-foreground mt-1">Series, episodes and live channels</p>
        </div>
        <Link to="/live-tv" className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
          <Radio className="w-4 h-4 text-destructive animate-pulse" /> Live TV <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <TmdbRow title="Trending This Week" items={trending.data} isLoading={trending.isLoading} type="tv" />
      <TmdbRow title="Airing Today" items={airing.data} isLoading={airing.isLoading} type="tv" />
      <TmdbRow title="On The Air" items={onAir.data} isLoading={onAir.isLoading} type="tv" />
      <TmdbRow title="Popular Series" items={popular.data} isLoading={popular.isLoading} type="tv" />
      <TmdbRow title="Top Rated" items={topRated.data} isLoading={topRated.isLoading} type="tv" />
    </AppLayout>
  );
};

export default TVPage;
