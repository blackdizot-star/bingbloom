import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface TrailerModalProps {
  videoKey: string | null;
  onClose: () => void;
}

const TrailerModal = ({ videoKey, onClose }: TrailerModalProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!videoKey);
  }, [videoKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !videoKey) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full text-white hover:bg-white/10"
        onClick={onClose}
        aria-label="Close trailer"
      >
        <X className="w-6 h-6" />
      </button>
      <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
          className="w-full h-full"
          title="Trailer"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default TrailerModal;
