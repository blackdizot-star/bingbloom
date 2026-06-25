import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Zap,
  Globe,
  Check,
  ChevronRight,
  Loader2,
  Download,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
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
import { saveDownload } from "@/lib/savedDownloads";

type Source = "bingbloom" | "fast";
type Step = "source" | "bingbloom" | "fast-loading" | "fast-list" | "fast-error";

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
  externalUrl: string;
  onOpenExternal: () => void;
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
  externalUrl,
  onOpenExternal,
}: Props) => {
  const [step, setStep] = useState<Step>("source");
  const [source, setSource] = useState<Source>("bingbloom");
  const [downloads, setDownloads] = useState<MovieboxDownload[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [resolvedTitle, setResolvedTitle] = useState(title);

  const reset = () => {
    setStep("source");
    setSource("bingbloom");
    setDownloads([]);
    setErrorMsg("");
  };

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(reset, 250);
  };

  const handleNext = async () => {
    if (source === "bingbloom") {
      setStep("bingbloom");
      return;
    }
    // Fast Downloads (MovieBox)
    setStep("fast-loading");
    const res = await resolveMovieboxDownloads({
      title,
      year,
      mediaType: type,
      season,
      episode,
    });
    if (!res.ok || !res.downloads || res.downloads.length === 0) {
      setErrorMsg(res.reason || "No downloadable file found for this title.");
      setStep("fast-error");
      return;
    }
    setResolvedTitle(res.title || title);
    setDownloads(res.downloads);
    setStep("fast-list");
  };

  const startFastDownload = (d: MovieboxDownload) => {
    const posterUrl = poster || backdrop || undefined;
    saveDownload({
      id: itemId,
      type,
      tmdbId,
      title: resolvedTitle,
      poster: posterUrl,
      backdrop: backdrop || undefined,
      season,
      episode,
      sizeMB: Math.round(d.size / 1024 / 1024),
    });
    // Fire-and-forget chunked download into IndexedDB for offline playback.
    void startDownload({
      id: itemId,
      type,
      tmdbId,
      title: resolvedTitle,
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

  const handleBingbloomContinue = () => {
    saveDownload({
      id: itemId,
      type,
      tmdbId,
      title,
      poster: poster || backdrop || undefined,
      backdrop: backdrop || undefined,
      season,
      episode,
      sourceUrl: externalUrl,
      sizeMB: 1080,
    });
    toast.success("Opening download page…");
    close(false);
    onOpenExternal();
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-sm bg-[#0f0f10] border-white/10 text-white p-0 overflow-hidden">
        {/* ---- Step: choose source ---- */}
        {step === "source" && (
          <div className="p-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">Choose download source</DialogTitle>
              <DialogDescription className="text-[11px] text-white/55">
                Pick where to get <span className="text-white font-semibold">{title}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => setSource("bingbloom")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                  source === "bingbloom"
                    ? "border-[#E50914] bg-[#E50914]/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className="w-9 h-9 grid place-items-center rounded-lg bg-[#E50914]/20 text-[#E50914]">
                  <Globe className="w-4 h-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-[12.5px] font-bold text-white">BingBloom</span>
                  <span className="block text-[10.5px] text-white/55">
                    Open external download page in-app
                  </span>
                </span>
                {source === "bingbloom" && <Check className="w-4 h-4 text-[#E50914]" />}
              </button>

              <button
                onClick={() => setSource("fast")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                  source === "fast"
                    ? "border-[#E50914] bg-[#E50914]/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className="w-9 h-9 grid place-items-center rounded-lg bg-amber-400/20 text-amber-400">
                  <Zap className="w-4 h-4" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-white">
                    Fast Downloads
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[8.5px] font-bold uppercase tracking-wide">
                      up to 5×
                    </span>
                  </span>
                  <span className="block text-[10.5px] text-white/55">
                    Download &amp; watch offline inside the app
                  </span>
                </span>
                {source === "fast" && <Check className="w-4 h-4 text-[#E50914]" />}
              </button>
            </div>

            <button
              onClick={handleNext}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[12px] font-bold text-white hover:opacity-90"
              style={{ background: "#E50914" }}
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ---- Step: BingBloom external confirm ---- */}
        {step === "bingbloom" && (
          <div className="p-4">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-[#E50914]" />
                <DialogTitle className="text-sm font-bold">You're leaving BingBloom</DialogTitle>
              </div>
              <DialogDescription className="text-[11px] text-white/65 leading-relaxed">
                We'll open an external download page inside an in-app browser. BingBloom doesn't host
                or control the file.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-3 text-[10px] text-white/40 break-all bg-black/40 rounded p-2 border border-white/5">
              {externalUrl}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setStep("source")}
                className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-white/10 text-white hover:bg-white/15"
              >
                Back
              </button>
              <button
                onClick={handleBingbloomContinue}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white hover:opacity-90"
                style={{ background: "#E50914" }}
              >
                Continue <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* ---- Step: Fast resolving ---- */}
        {step === "fast-loading" && (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-7 h-7 text-[#E50914] animate-spin" />
            <p className="mt-3 text-[12px] font-semibold text-white">Finding fast download…</p>
            <p className="mt-1 text-[10.5px] text-white/50">Checking quality options for “{title}”.</p>
          </div>
        )}

        {/* ---- Step: Fast resolution list ---- */}
        {step === "fast-list" && (
          <div className="p-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">Select quality</DialogTitle>
              <DialogDescription className="text-[11px] text-white/55">
                {resolvedTitle} — downloads to your device for offline viewing.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-3 space-y-2 max-h-[46vh] overflow-y-auto scrollbar-hide">
              {downloads.map((d, i) => (
                <button
                  key={`${d.resolution}-${i}`}
                  onClick={() => startFastDownload(d)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition"
                >
                  <span className="w-9 h-9 grid place-items-center rounded-lg bg-[#E50914]/15 text-[#E50914]">
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
              onClick={() => setStep("source")}
              className="mt-3 w-full px-3 py-2 rounded-lg text-[11px] font-semibold bg-white/10 text-white hover:bg-white/15"
            >
              Back
            </button>
          </div>
        )}

        {/* ---- Step: Fast error / fallback ---- */}
        {step === "fast-error" && (
          <div className="p-4">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <DialogTitle className="text-sm font-bold">Not available on Fast Downloads</DialogTitle>
              </div>
              <DialogDescription className="text-[11px] text-white/65 leading-relaxed">
                {errorMsg} You can still use the BingBloom download page instead.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setStep("source")}
                className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-white/10 text-white hover:bg-white/15"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setSource("bingbloom");
                  setStep("bingbloom");
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white hover:opacity-90"
                style={{ background: "#E50914" }}
              >
                Use BingBloom
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DownloadSourceSheet;
