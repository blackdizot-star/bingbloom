import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { X, ExternalLink, RefreshCw, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title?: string;
}

const InAppBrowserSheet = ({ open, onOpenChange, url, title }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoaded(false);
    setBlocked(false);
    const t = setTimeout(() => {
      if (!loaded) {
        // host likely blocks framing — open externally and close sheet
        window.open(url, "_blank", "noopener,noreferrer");
        setBlocked(true);
        onOpenChange(false);
      }
    }, 4500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, url]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92vh] p-0 bg-[#0a0a0a] border-white/10 text-white flex flex-col">
        <div className="flex items-center gap-2 px-3 h-11 border-b border-white/10 bg-[#0a0a0a]">
          <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-full hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate">{title || "Download"}</p>
            <p className="text-[10px] text-white/45 truncate">{url}</p>
          </div>
          <button
            onClick={() => iframeRef.current && (iframeRef.current.src = url)}
            className="p-1.5 rounded-full hover:bg-white/10" title="Reload"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-semibold text-white"
            style={{ background: "#FF2D8F" }}
          >
            Open <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="flex-1 relative bg-[#0a0a0a]">
          {!loaded && !blocked && (
            <div className="absolute inset-0 grid place-items-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF2D8F]" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={url}
            onLoad={() => setLoaded(true)}
            className="w-full h-full"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-popups-to-escape-sandbox"
            allow="autoplay; fullscreen; clipboard-write"
            title="Download"
            style={{ border: 0 }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InAppBrowserSheet;
