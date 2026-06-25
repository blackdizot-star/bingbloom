import { useState } from "react";
import { Download } from "lucide-react";
import { saveDownload } from "@/lib/savedDownloads";
import { toast } from "sonner";
import DownloadConfirmDialog from "./DownloadConfirmDialog";
import InAppBrowserSheet from "./InAppBrowserSheet";

interface Props {
  type: "movie" | "tv" | "anime";
  tmdbId: string;
  title: string;
  season?: number;
  episode?: number;
  id?: string;
  poster?: string | null;
  backdrop?: string | null;
  size?: "sm" | "md";
}

const DownloadButton = ({ type, tmdbId, title, season, episode, poster, backdrop, size = "md" }: Props) => {
  const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const itemId = `${type}-${tmdbId}${season ? `-s${season}-e${episode ?? 1}` : ""}`;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sourceUrl = `https://videodownloader.site/?q=${encodeURIComponent(title)}`;

  const handleContinue = () => {
    saveDownload({
      id: itemId, type, tmdbId, title, poster, backdrop, season, episode,
      sourceUrl, sizeMB: 1080,
    });
    toast.success("Added to your Downloads");
    setConfirmOpen(false);
    setSheetOpen(true);
  };

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className={`inline-flex items-center gap-2 rounded-lg font-semibold text-white transition-all hover:scale-[1.02] ${padding}`}
        style={{ background: "#E50914" }}
      >
        <Download className={icon} />
        Download
      </button>
      <DownloadConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={title}
        url={sourceUrl}
        onContinue={handleContinue}
      />
      <InAppBrowserSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        url={sourceUrl}
        title={title}
      />
    </>
  );
};

export default DownloadButton;
