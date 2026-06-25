import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import ContentCard from "@/components/ContentCard";
import { useMyList } from "@/hooks/useMyList";
import { useLikedVideos } from "@/hooks/useLikedVideos";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { Bookmark, Heart, PlayCircle, Download } from "lucide-react";

type Tab = "saved" | "liked" | "continue" | "downloads";

const tabs: { id: Tab; label: string; icon: typeof Bookmark }[] = [
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "liked", label: "Liked", icon: Heart },
  { id: "continue", label: "Continue", icon: PlayCircle },
  { id: "downloads", label: "Downloads", icon: Download },
];


const Empty = ({ icon: Icon, label, hint }: { icon: typeof Bookmark; label: string; hint: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
    <Icon className="w-10 h-10 opacity-60" />
    <p className="text-sm font-medium">{label}</p>
    <p className="text-xs">{hint}</p>
  </div>
);

const LibraryPage = () => {
  const [active, setActive] = useState<Tab>("saved");
  const saved = useMyList();
  const liked = useLikedVideos();
  const continueWatching = useContinueWatching();

  return (
    <AppLayout>
      <SEO title="Library – BingBloom" description="All your saved content in one place — watchlist, liked videos and continue watching on BingBloom." />
      <div className="px-4 sm:px-6 pt-4 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Library</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">All your saved content in one place</p>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 sticky top-12 sm:top-14 z-20 bg-background/95 backdrop-blur-md">
        <div
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {tabs.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap min-h-[36px] transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-8 pt-2">
        {active === "saved" && (
          saved.length === 0 ? (
            <Empty icon={Bookmark} label="No saved items" hint="Tap the bookmark icon on any video to save it" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {saved.map((v) => <ContentCard key={v.id} video={v} />)}
            </div>
          )
        )}

        {active === "liked" && (
          liked.length === 0 ? (
            <Empty icon={Heart} label="No liked videos yet" hint="Like videos to see them here" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {liked.map((v) => <ContentCard key={v.id} video={v} />)}
            </div>
          )
        )}

        {active === "continue" && (
          continueWatching.length === 0 ? (
            <Empty icon={PlayCircle} label="Nothing in progress" hint="Start watching to see content here" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {continueWatching.map((e) => (
                <div key={e.video.id} className="relative">
                  <ContentCard video={e.video} />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 rounded-b">
                    <div className="h-full bg-primary rounded-b" style={{ width: `${e.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {active === "downloads" && (
          <Empty icon={Download} label="Downloads not available" hint="Streaming-only — offline downloads coming soon" />
        )}

      </div>
    </AppLayout>
  );
};

export default LibraryPage;
