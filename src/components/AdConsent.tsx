import { useEffect, useRef } from "react";

const AD_SCRIPT_SRC = "https://www.highperformanceformat.com/abc2c7fde6d68fc96757765c351d9dfc/invoke.js";
const AD_CONTAINER_ID = "container-abc2c7fde6d68fc96757765c351d9dfc";

/** Mounts the sponsor script silently — no consent dialog. */
export default function AdConsent() {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;
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
  }, []);

  return <div id="ad-consent-root" className="hidden" />;
}
