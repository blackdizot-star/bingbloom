import { useEffect, useState } from "react";

const AD_SCRIPT_SRC = "https://www.highperformanceformat.com/0d460b18275609106dbf608190ecb46b/invoke.js";
const AD_CONTAINER_ID = "container-0d460b18275609106dbf608190ecb46b";

export default function AdConsent() {
  const [visible, setVisible] = useState(false);
  const [adInjected, setAdInjected] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.sessionStorage.getItem("bingbloom-ad-consent");
      if (!dismissed) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const injectAdScript = () => {
    const host = document.getElementById("ad-consent-root");
    if (!host) return;

    host.innerHTML = "";
    const container = document.createElement("div");
    container.id = AD_CONTAINER_ID;
    container.style.cssText = "width:100%;min-height:120px;display:flex;align-items:center;justify-content:center;";
    host.appendChild(container);

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = AD_SCRIPT_SRC;
    host.appendChild(script);
  };

  const handleAccept = () => {
    try {
      window.sessionStorage.setItem("bingbloom-ad-consent", "1");
    } catch {}

    injectAdScript();
    setAdInjected(true);
    setVisible(false);
  };

  useEffect(() => {
    if (!visible && !adInjected) {
      injectAdScript();
      setAdInjected(true);
    }
  }, [visible, adInjected]);

  return (
    <>
      <div id="ad-consent-root" className="hidden" />
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-[28px] border border-white/10 bg-background/95 p-5 shadow-[0_32px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="mb-4 rounded-[24px] border border-primary/20 bg-[#111118] p-4 text-left text-sm text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary text-lg">🎬</span>
                <div>
                  <p className="font-semibold text-base">How BingBloom Stays Free</p>
                  <p className="text-[13px] text-muted-foreground mt-1">Tap the sponsor message and keep the app free for everyone.</p>
                </div>
              </div>
              <p className="text-xs leading-6 text-slate-300">
                BingBloom is completely free because of our sponsors. When you see a sponsored message, click it — it helps keep the app free for everyone.
              </p>
            </div>

            <button
              className="inline-flex w-full items-center justify-center rounded-full border border-primary bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              onClick={handleAccept}
            >
              Got it — let&apos;s watch!
            </button>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              (This message appears once per visit)
            </p>
          </div>
        </div>
      )}
    </>
  );
}
