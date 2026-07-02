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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="max-w-md w-full bg-white rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-3">Our sponsors keep us free</h3>
        <p className="text-sm text-muted-foreground mb-4">Please support the app by viewing this sponsored content.</p>
        <div className="flex justify-center">
          <button
            className="bg-brand-600 text-white px-4 py-2 rounded-md"
            onClick={handleAccept}
          >
            Let's watch now
          </button>
        </div>
      </div>
    </div>
  );
}
