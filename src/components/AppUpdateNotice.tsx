import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";

const UPDATE_URL = "https://whatsapp.com/channel/0029VbD2CdHEwEjtJ5Utbo2n";

const AppUpdateNotice = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem("bingbloom-update-notice-dismissed");
    if (dismissed) return;

    setVisible(true);

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }
  }, []);

  const handleOpen = () => {
    window.open(UPDATE_URL, "_blank", "noopener,noreferrer");
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("BingBloom update", {
        body: "Join our WhatsApp channel for the latest APK and app news.",
        icon: "/logo-compact.png",
      });
    }
  };

  const dismiss = () => {
    window.localStorage.setItem("bingbloom-update-notice-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="sticky top-0 z-[60] border-b border-primary/20 bg-gradient-to-r from-primary/15 via-background to-primary/10 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">New BingBloom update is live.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpen}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Join update channel
          </button>
          <button
            onClick={dismiss}
            className="rounded-full p-1 text-muted-foreground transition hover:bg-muted"
            aria-label="Dismiss update notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppUpdateNotice;
