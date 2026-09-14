import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Zap,
  ChevronRight,
  Loader2,
  Download,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  resolveMovieboxDownloads,
  movieboxProxyUrl,
  formatBytes,
  resolutionLabel,
  type MovieboxDownload,
} from "@/lib/moviebox";
import { startDownload } from "@/lib/offlineDownloads";
import InAppBrowserSheet from "@/components/InAppBrowserSheet";

type Source = "fast" | "external";
type Step = "choose" | "loading" | "list" | "error" | "redirect";

const EXTERNAL_DOWNLOADER_URL = "https://videodownloader.site/";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "movie" | "tv" | "anime";
  tmdbId: string;
  title: string;
  year?: string;
  season?: number;
  episode?: number;
  itemId: string;
  poster?: string | null;
  backdrop?: string | null;
}

const DownloadSourceSheet = ({
  open,
  onOpenChange,
  type,
  tmdbId,
  title,
  year,
  season,
  episode,
  itemId,
  poster,
  backdrop,
}: Props) => {
  const [step, setStep] = useState<Step>("redirect");
  const [source, setSource] = useState<Source>("external");
  const [downloads, setDownloads] = useState<MovieboxDownload[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [resolvedTitle, setResolvedTitle] = useState(title);
  const [browserOpen, setBrowserOpen] = useState(false);

  const isSeries = type === "tv";
  const episodeLabel = isSeries ? `S${season ?? 1} · E${episode ?? 1}` : year || "Movie";

  const close = (v: boolean) => onOpenChange(v);

  const resolve = async (chosen: Source) => {
    setSource(chosen);
    setErrorMsg("");
    if (chosen === "external") {
      // External downloader doesn't need resolution picking — just confirm redirect.
      setStep("redirect");
      return;
    }
    setStep("loading");
    const res = await resolveMovieboxDownloads({
      title,
      year,
      mediaType: type,
      season,
      episode,
    });
    if (!res.ok || !res.downloads || res.downloads.length === 0) {
      setErrorMsg(res.reason || "No downloadable file found for this title.");
      setStep("error");
      return;
    }
    setResolvedTitle(res.title || title);
    setDownloads(res.downloads);
    setStep("list");
  };

  // Open external downloader with title pre-filled (title only — no season/episode).
  const continueToExternal = () => {
    close(false);
    setBrowserOpen(true);
  };

  // Reset to chooser whenever sheet (re)opens.
  useEffect(() => {
    if (open) {
      setStep("redirect");
      setErrorMsg("");
      setDownloads([]);
      setResolvedTitle(title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, itemId]);

  const startFastDownload = (d: MovieboxDownload) => {
    const posterUrl = poster || backdrop || undefined;
    const displayTitle = isSeries
      ? `${resolvedTitle} · S${season ?? 1}E${episode ?? 1}`
      : resolvedTitle;
    void startDownload({
      id: itemId,
      type,
      tmdbId,
      title: displayTitle,
      seriesTitle: isSeries ? resolvedTitle : undefined,
      season,
      episode,
      poster: posterUrl,
      backdrop: backdrop || undefined,
      sourceUrl: movieboxProxyUrl(d.url),
      mime: "video/mp4",
    }).catch(() => {
      toast.error("Download failed. Please try again.");
    });
    toast.success(`Downloading ${resolutionLabel(d.resolution)} · check Downloads`);
    close(false);
  };

  const startExternalDownload = (d: MovieboxDownload) => {
    const url = movieboxProxyUrl(d.url);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.rel = "noopener noreferrer";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Opening in your downloader…");
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    close(false);
  };

  const onPick = (d: MovieboxDownload) =>
    source === "fast" ? startFastDownload(d) : startExternalDownload(d);

  const externalUrl = `${EXTERNAL_DOWNLOADER_URL}?q=${encodeURIComponent(title)}&title=${encodeURIComponent(title)}`;

  return (
    <>
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-sm bg-[#0f0f10] border-white/10 text-white p-0 overflow-hidden">
        {/* ---- Resolving ---- */}
        {step === "loading" && (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <span className="w-11 h-11 grid place-items-center rounded-xl bg-amber-400/15 text-amber-400 mb-3">
              {source === "fast" ? <Zap className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
            </span>
            <Loader2 className="w-6 h-6 text-[#FF2D8F] animate-spin" />
            <p className="mt-3 text-[12px] font-semibold text-white">Finding download…</p>
            <p className="mt-1 text-[10.5px] text-white/50">
              Checking quality options for “{title}” {isSeries ? `· ${episodeLabel}` : ""}.
            </p>
          </div>
        )}

        {/* ---- External redirect confirm ---- */}
        {step === "redirect" && (
          <div className="p-5 text-center">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 grid place-items-center rounded-xl bg-sky-400/15 text-sky-400 mb-3">
                <ExternalLink className="w-5 h-5" />
              </div>
              <DialogTitle className="text-sm font-bold">You're being redirected</DialogTitle>
              <DialogDescription className="text-[11px] text-white/65 leading-relaxed mt-1">
                We'll open <span className="text-white font-semibold">videodownloader.site</span> in a new tab with the title pre-filled. Tap continue to proceed.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 text-left">
              <p className="text-[9.5px] uppercase tracking-wider text-white/40 font-semibold">Title</p>
              <p className="text-[12px] font-bold text-white mt-0.5 truncate">{title}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => close(false)}
                className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-white/10 text-white hover:bg-white/15"
              >
                Back
              </button>
              <button
                onClick={continueToExternal}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white hover:opacity-90"
                style={{ background: "#FF2D8F" }}
              >
                Continue <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* ---- Resolution list ---- */}
        {step === "list" && (
          <div className="p-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
                {source === "fast" ? (
                  <>
                    <Zap className="w-4 h-4 text-amber-400" /> Fast Download
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 text-sky-400" /> External Downloader
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-white/55">
                {resolvedTitle}
                {isSeries ? ` · ${episodeLabel}` : ""} —{" "}
                {source === "fast"
                  ? "saves to your device for offline viewing."
                  : "opens the file with your browser or download manager."}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-3 space-y-2 max-h-[46vh] overflow-y-auto scrollbar-hide">
              {downloads.map((d, i) => (
                <button
                  key={`${d.resolution}-${i}`}
                  onClick={() => onPick(d)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition"
                >
                  <span className="w-9 h-9 grid place-items-center rounded-lg bg-[#FF2D8F]/15 text-[#FF2D8F]">
                    <Download className="w-4 h-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[12.5px] font-bold text-white">
                      {resolutionLabel(d.resolution)}
                    </span>
                    <span className="block text-[10.5px] text-white/55">
                      {d.format} {d.size ? `· ${formatBytes(d.size)}` : ""}
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>
              ))}
            </div>
            <button
              onClick={() => close(false)}
              className="mt-3 w-full px-3 py-2 rounded-lg text-[11px] font-semibold bg-white/5 text-white/70 hover:bg-white/10"
            >
              ← Change source
            </button>
          </div>
        )}

        {/* ---- Error ---- */}
        {step === "error" && (
          <div className="p-4">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <DialogTitle className="text-sm font-bold">Not available right now</DialogTitle>
              </div>
              <DialogDescription className="text-[11px] text-white/65 leading-relaxed">
                {errorMsg}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => close(false)}
                className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-white/10 text-white hover:bg-white/15"
              >
                Back
              </button>
              <button
                onClick={() => void resolve(source)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white hover:opacity-90"
                style={{ background: "#FF2D8F" }}
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    <InAppBrowserSheet
      open={browserOpen}
      onOpenChange={setBrowserOpen}
      url={externalUrl}
      title={`Download ${title}`}
    />
    </>
  );
};

export default DownloadSourceSheet;
