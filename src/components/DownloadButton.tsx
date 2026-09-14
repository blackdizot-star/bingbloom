import { useState } from "react";
import { Download } from "lucide-react";
import DownloadSourceSheet from "./DownloadSourceSheet";

interface Props {
  type: "movie" | "tv" | "anime";
  tmdbId: string;
  title: string;
  year?: string;
  season?: number;
  episode?: number;
  id?: string;
  poster?: string | null;
  backdrop?: string | null;
  size?: "sm" | "md" | "icon";
}

const DownloadButton = ({ type, tmdbId, title, year, season, episode, poster, backdrop, size = "md" }: Props) => {
  const itemId = `${type}-${tmdbId}${season ? `-s${season}-e${episode ?? 1}` : ""}`;
  const [sourceOpen, setSourceOpen] = useState(false);

  const sheet = (
    <DownloadSourceSheet
      open={sourceOpen}
      onOpenChange={setSourceOpen}
      type={type}
      tmdbId={tmdbId}
      title={title}
      year={year}
      season={season}
      episode={episode}
      itemId={itemId}
      poster={poster}
      backdrop={backdrop}
    />
  );

  if (size === "icon") {
    return (
      <>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSourceOpen(true); }}
          className="grid h-8 w-8 place-items-center rounded-md border border-border/60 bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          aria-label="Download"
          title="Download"
        >
          <Download className="h-4 w-4" strokeWidth={2.5} />
        </button>
        {sheet}
      </>
    );
  }

  const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <>
      <button
        onClick={() => setSourceOpen(true)}
        className={`inline-flex items-center gap-2 rounded-lg font-semibold text-white transition-all hover:scale-[1.02] ${padding}`}
        style={{ background: "#FF2D8F" }}
      >
        <Download className={icon} />
        Download
      </button>
      {sheet}
    </>
  );
};

export default DownloadButton;
