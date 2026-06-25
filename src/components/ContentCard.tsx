import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import type { NormalizedVideo } from "@/hooks/useKenyaContent";
import { shortenTitle } from "@/lib/titleUtils";

interface ContentCardProps {
  video: NormalizedVideo;
  progress?: number;
  variant?: "poster" | "wide" | "backdrop";
}

const ContentCard = ({ video, progress, variant = "poster" }: ContentCardProps) => {
  const aspectClass = variant === "wide" ? "aspect-video" : variant === "backdrop" ? "aspect-[16/9]" : "aspect-[2/3]";
  const widthStyle = variant === "wide" ? 200 : variant === "backdrop" ? 220 : 120;

  return (
    <Link
      to={`/watch/${video.id}`}
      className="block flex-shrink-0 snap-start relative rounded-lg overflow-hidden group card-hover"
      style={{ width: widthStyle, minWidth: widthStyle }}
    >
      <div className={`${aspectClass} bg-card relative overflow-hidden rounded-lg`}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        </div>

        {progress != null && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-muted">
            <div className="h-full bg-destructive rounded-r" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        )}
      </div>

      <div className="mt-1.5 px-0.5">
        <p className="text-[13px] font-medium text-foreground line-clamp-2 leading-snug">
          {shortenTitle(video.title)}
        </p>
        {video.views && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{video.views} views</p>
        )}
      </div>
    </Link>
  );
};

export default ContentCard;
