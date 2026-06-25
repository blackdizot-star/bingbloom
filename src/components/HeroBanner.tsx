import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import type { NormalizedVideo } from "@/hooks/useKenyaContent";
import { shortenTitle } from "@/lib/titleUtils";
import { useState, useEffect } from "react";

const HeroBanner = ({ videos, isLoading }: { videos: NormalizedVideo[]; isLoading?: boolean }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (videos.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % Math.min(videos.length, 6)), 8000);
    return () => clearInterval(timer);
  }, [videos.length]);

  if (isLoading || !videos.length) {
    return (
      <div className="relative w-full h-[50vh] md:h-[65vh] bg-card flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const hero = videos[current] || videos[0];

  return (
    <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
      <img src={hero.thumbnail} alt={hero.title} className="absolute inset-0 w-full h-full object-cover" key={hero.id} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent" />

      <div className="absolute bottom-16 md:bottom-24 left-0 right-0 px-[4%] max-w-2xl">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight mb-2">
          {shortenTitle(hero.title, 60)}
        </h1>
        <p className="text-sm text-muted-foreground mb-4">{hero.channel} • {hero.views} views</p>
        <div className="flex gap-3">
          <Link to={`/watch/${hero.id}`}
            className="flex items-center gap-2 bg-foreground text-background font-semibold px-6 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity">
            <Play className="w-4 h-4 fill-current" /> Play
          </Link>
          <Link to={`/watch/${hero.id}`}
            className="flex items-center gap-2 border border-foreground/30 text-foreground font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors">
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
