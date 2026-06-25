import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ExternalLink, ShieldAlert } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
  onContinue: () => void;
}

const DownloadConfirmDialog = ({ open, onOpenChange, title, url, onContinue }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-[#0f0f10] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-[#E50914]" />
            <DialogTitle className="text-sm font-bold">You're leaving BingBloom</DialogTitle>
          </div>
          <DialogDescription className="text-[11px] text-white/65 leading-relaxed">
            To download <span className="text-white font-semibold">{title}</span>, we'll open an external
            download page inside an in-app browser. BingBloom doesn't host or control the file.
          </DialogDescription>
        </DialogHeader>
        <div className="text-[10px] text-white/40 break-all bg-black/40 rounded p-2 border border-white/5">
          {url}
        </div>
        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-white/10 text-white hover:bg-white/15"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white hover:opacity-90"
            style={{ background: "#E50914" }}
          >
            Continue <ExternalLink className="w-3 h-3" />
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadConfirmDialog;
