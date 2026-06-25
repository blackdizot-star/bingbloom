import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * A slim, non-intrusive banner that slides in when the device goes offline and
 * gently confirms when the connection returns. Uses cached metadata so the app
 * keeps working while offline.
 */
const OfflineBanner = () => {
  const online = useOnlineStatus();
  const [show, setShow] = useState(false);
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    if (!online) {
      setShow(true);
      setReconnected(false);
    } else if (show) {
      // briefly show a "back online" state, then hide
      setReconnected(true);
      const t = setTimeout(() => {
        setShow(false);
        setReconnected(false);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [online]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!show) return null;

  return (
    <div
      className="fixed inset-x-0 z-[60] flex justify-center px-4 pointer-events-none"
      style={{ top: "calc(env(safe-area-inset-top) + 8px)" }}
    >
      <div
        className={`pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-md transition-all ${
          reconnected
            ? "bg-emerald-600/90 text-white"
            : "bg-black/85 text-white border border-white/10"
        }`}
      >
        <WifiOff className="h-3.5 w-3.5" />
        {reconnected
          ? "Back online — syncing the latest"
          : "You're offline · browsing saved content"}
      </div>
    </div>
  );
};

export default OfflineBanner;
