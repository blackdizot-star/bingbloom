import { useEffect, useState } from "react";

const AppSplashScreen = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const finish = () => {
      setFadeOut(true);
      window.setTimeout(() => setVisible(false), 350);
    };

    const target = window.setTimeout(finish, 1800);
    if (document.readyState === "complete") {
      window.clearTimeout(target);
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      window.clearTimeout(target);
      window.removeEventListener("load", finish);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 transition-opacity duration-300 ${fadeOut ? "opacity-0" : "opacity-100"}`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-3">
        <img
          src={"/logo-compact.png"}
          alt="BingBloom"
          className="h-16 w-16 animate-[bounce_1s_ease-in-out_infinite] rounded-2xl object-contain shadow-[0_0_22px_rgba(229,9,20,0.3)]"
        />
        <p className="text-sm font-semibold tracking-[0.3em] text-white/80 uppercase">Loading BingBloom</p>
      </div>
    </div>
  );
};

export default AppSplashScreen;
