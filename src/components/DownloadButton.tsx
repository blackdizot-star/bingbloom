import { useState } from "react";
import { Download } from "lucide-react";
import DownloadSourceSheet from "./DownloadSourceSheet";
import InAppBrowserSheet from "./InAppBrowserSheet";

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
  size?: "sm" | "md";
}

const DownloadButton = ({ type, tmdbId, title, year, season, episode, poster, backdrop, size = "md" }: Props) => {
  const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const itemId = `${type}-${tmdbId}${season ? `-s${season}-e${episode ?? 1}` : ""}`;
  const [sourceOpen, setSourceOpen] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);

  const externalUrl = `https://videodownloader.site/?q=${encodeURIComponent(title)}`;

  return (
    <>
      <button
        onClick={() => setSourceOpen(true)}
        className={`inline-flex items-center gap-2 rounded-lg font-semibold text-white transition-all hover:scale-[1.02] ${padding}`}
        style={{ background: "#E50914" }}
      >
        <Download className={icon} />
        Download
      </button>
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
        externalUrl={externalUrl}
        onOpenExternal={() => setBrowserOpen(true)}
      />
      <InAppBrowserSheet
        open={browserOpen}
        onOpenChange={setBrowserOpen}
        url={externalUrl}
        title={title}
      />
    </>
  );
};

export default DownloadButton;
