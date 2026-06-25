import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { searchPiped, type PipedVideo } from "@/lib/piped";
import { shortenTitle } from "@/lib/titleUtils";
import AdSlot from "./AdSlot";

interface EpisodesListProps {
  channelName: string;
  title: string;
  currentVideoId: string;
}

function extractEpisodeNumber(title: string): number {
  // Try matching common patterns: "Episode 5", "Ep 5", "E05", "S1E5", "#5", "Part 5"
  const patterns = [
    /s\d+\s*e(\d+)/i,
    /episode\s*(\d+)/i,
    /ep\.?\s*(\d+)/i,
    /\be(\d+)\b/i,
    /part\s*(\d+)/i,
    /#(\d+)/,
  ];
  for (const p of patterns) {
    const m = title.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return 999; // no episode number found → sort last
}

const EpisodesList = ({ channelName, title, currentVideoId }: EpisodesListProps) => {
  const [episodes, setEpisodes] = useState<PipedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!channelName || !title) return;
    setLoading(true);

    const seriesName = title
      .replace(/\s*(episode|ep|e)\s*\d+.*/i, "")
      .replace(/\s*s\d+\s*e\d+.*/i, "")
      .replace(/\s*part\s*\d+.*/i, "")
      .replace(/\s*#\d+.*/i, "")
      .replace(/\s*-\s*$/, "")
      .trim();

    if (seriesName.length < 3) {
      setLoading(false);
      return;
    }

    searchPiped(`${channelName} ${seriesName}`)
      .then((results) => {
        const filtered = results
          .filter((v) => {
            const vid = v.url?.replace("/watch?v=", "") || "";
            return vid && v.uploaderName === channelName;
          })
          .slice(0, 40);

        // Sort by episode number ascending
        filtered.sort((a, b) => extractEpisodeNumber(a.title) - extractEpisodeNumber(b.title));
        setEpisodes(filtered);
      })
      .catch(() => setEpisodes([]))
      .finally(() => setLoading(false));
  }, [channelName, title, currentVideoId]);

  if (loading) {
    return (
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-xs">Looking for episodes...</span>
        </div>
      </div>
    );
  }

  if (episodes.length === 0) return null;

  const displayed = expanded ? episodes : episodes.slice(0, 5);

  return (
    <div className="px-4 py-4 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-foreground">📺 Episodes</h3>
        <span className="text-[10px] text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
          {episodes.length} episodes
        </span>
      </div>
      <div className="space-y-2">
        {displayed.map((ep, index) => {
          const vid = ep.url?.replace("/watch?v=", "") || "";
          const dur = ep.duration || 0;
          const mins = Math.floor(dur / 60);
          const secs = dur % 60;
          const isCurrent = vid === currentVideoId;
          const epNum = extractEpisodeNumber(ep.title);
          const displayNum = epNum < 999 ? epNum : index + 1;

          return (
            <div key={vid}>
              <Link
                to={`/watch/${vid}`}
                className={`flex gap-3 p-2 rounded-lg transition-colors ${
                  isCurrent ? "bg-primary/20 border border-primary/30" : "bg-card hover:bg-accent"
                }`}
              >
                <div className="flex items-center justify-center w-8 flex-shrink-0">
                  <span className="text-sm font-bold text-muted-foreground">{displayNum}</span>
                </div>
                <div className="relative w-28 flex-shrink-0 rounded-md overflow-hidden aspect-video bg-muted">
                  <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                    <Play className={`w-4 h-4 fill-current ${isCurrent ? "text-primary" : "text-foreground"}`} />
                  </div>
                  <span className="absolute bottom-0.5 right-0.5 bg-background/80 text-foreground text-[8px] px-1 rounded">
                    {mins}:{secs.toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold line-clamp-2 leading-snug ${isCurrent ? "text-primary" : "text-foreground"}`}>
                    {shortenTitle(ep.title)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {ep.views >= 1_000_000
                      ? `${(ep.views / 1_000_000).toFixed(1)}M views`
                      : ep.views >= 1_000
                      ? `${(ep.views / 1_000).toFixed(1)}K views`
                      : `${ep.views || 0} views`}
                  </p>
                  {isCurrent && (
                    <span className="text-[9px] text-primary font-bold mt-0.5 block">▶ Now Playing</span>
                  )}
                </div>
              </Link>
              {(index + 1) % 5 === 0 && index < displayed.length - 1 && (
                <AdSlot id={`ep-${index + 1}`} height={70} className="!my-3 !px-0" />
              )}
            </div>
          );
        })}
      </div>
      {episodes.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mx-auto mt-3 text-xs text-primary font-semibold"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Show Less" : `Show All ${episodes.length} Episodes`}
        </button>
      )}
    </div>
  );
};

export default EpisodesList;
