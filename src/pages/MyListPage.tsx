import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import ContentCard from "@/components/ContentCard";
import { useMyList } from "@/hooks/useMyList";
import { Bookmark } from "lucide-react";

const MyListPage = () => {
  const list = useMyList();

  return (
    <AppLayout>
      <SEO title="Watchlist – MovieNoir" description="Your saved movies and shows on MovieNoir — pick up where you left off." />
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground mb-1">Watchlist</h1>
        <p className="text-sm text-muted-foreground">
          {list.length} saved video{list.length !== 1 ? "s" : ""}
        </p>
      </div>
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
          <Bookmark className="w-12 h-12" />
          <p className="text-sm font-medium">Your watchlist is empty</p>
          <p className="text-xs">Tap + on any video to save it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 px-6 pb-8">
          {list.map((v) => (
            <ContentCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default MyListPage;
