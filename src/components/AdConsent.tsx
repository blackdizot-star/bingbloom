import { useEffect, useState } from "react";

const AD_SCRIPT_SRC = "https://pl29160309.effectivecpmnetwork.com/0d460b18275609106dbf608190ecb46b/invoke.js";
const AD_CONTAINER_ID = "container-0d460b18275609106dbf608190ecb46b";

export default function AdConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // Use sessionStorage so the consent appears once per visit (cleared when the app/session closes)
      const dismissed = window.sessionStorage.getItem("bingbloom-ad-consent");
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // mark accepted so we don't show again
    try {
      // Persist only for this session so the modal shows on next visit
      window.sessionStorage.setItem("bingbloom-ad-consent", "1");
    } catch {}

    // inject ad script into a hidden container that will be shown
    const host = document.getElementById("ad-consent-root");
    if (host) {
      host.innerHTML = "";
      const container = document.createElement("div");
      container.id = AD_CONTAINER_ID;
      host.appendChild(container);

      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src = AD_SCRIPT_SRC;
      host.appendChild(script);
    }

    setVisible(false);
  };

  if (!visible) return <div id="ad-consent-root" />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl p-4 sm:p-6 text-center shadow-lg">
        <div className="text-sm font-semibold mb-2">🎬 How BingBloom Stays Free</div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          BingBloom is completely free because of our sponsors. When you see a sponsored message, click it — it helps keep the app free for everyone.
        </p>
        <div className="flex justify-center">
          <button
            className="bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-bold"
            onClick={handleAccept}
          >
            Got it — let's watch!
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">(This message appears once per visit)</p>
      </div>
    </div>
  );
}
