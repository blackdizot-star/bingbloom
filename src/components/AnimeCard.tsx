import { useNavigate } from "react-router-dom";
import { Play, Star } from "lucide-react";
import type { NormalizedVideo } from "@/hooks/useKenyaContent";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";

const AnimeCard = ({ video }: { video: NormalizedVideo }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isAnime = video.id.startsWith("anime-");
  const malId = isAnime ? video.id.replace("anime-", "") : null;

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    if (!isAnime) return;
    e.preventDefault();
    // Navigate to anime detail page
    if (malId) {
      navigate(`/anime/${malId}`);
    }
  }, [malId, isAnime, navigate]);

  return (
    <div
      onClick={isAnime ? handleClick : undefined}
      className="block min-w-[100px] w-[100px] md:min-w-[130px] md:w-[130px] flex-shrink-0 snap-start cursor-pointer"
    >
      <motion.div
        whileHover={{ scale: 1.04, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative rounded-md overflow-hidden group"
      >
        <div className="aspect-[3/4] bg-muted relative">
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
          {video.views && (
            <span className="absolute top-1 right-1 bg-primary/90 text-primary-foreground text-[8px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
              <Star className="w-2 h-2 fill-current" />{video.views}
            </span>
          )}
          <span className="absolute bottom-1 right-1 bg-background/80 text-foreground text-[8px] px-1 py-0.5 rounded font-medium">
            {video.duration}
          </span>
          <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {loading ? (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center animate-spin">
                <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-primary-foreground fill-current ml-[1px]" />
              </div>
            )}
          </div>
        </div>
        <p className="mt-1 text-[10px] font-medium text-foreground line-clamp-2 leading-snug">{video.title}</p>
        {video.channel && (
          <p className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">{video.channel}</p>
        )}
      </motion.div>
    </div>
  );
};

export default AnimeCard;
