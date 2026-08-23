import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import ContentCard from "@/components/ContentCard";
import { useLikedVideos } from "@/hooks/useLikedVideos";
import { ThumbsUp } from "lucide-react";

const LikedVideosPage = () => {
  const list = useLikedVideos();

  return (
    <AppLayout>
      <SEO title="Liked Videos – MovieNoir" description="Videos you've liked on MovieNoir — all your favourites in one place." />
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground mb-1">Liked Videos</h1>
        <p className="text-sm text-muted-foreground">
          {list.length} liked video{list.length !== 1 ? "s" : ""}
        </p>
      </div>
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
          <ThumbsUp className="w-12 h-12" />
          <p className="text-sm font-medium">No liked videos yet</p>
          <p className="text-xs">Tap the like button on any video to save it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 px-6">
          {list.map((v) => (
            <ContentCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default LikedVideosPage;
