import { useEffect, useState } from "react";
import splash1 from "@/assets/splash-1.jpg";
import splash2 from "@/assets/splash-2.jpg";
import splash3 from "@/assets/splash-3.jpg";

const IMAGES = [splash1, splash2, splash3];
const DURATION_MS = 6000;
const SLIDE_MS = Math.floor(DURATION_MS / IMAGES.length); // ~2s each

const AppSplashScreen = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [index, setIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const slide = window.setInterval(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
    }, SLIDE_MS);

    const welcome = window.setTimeout(() => setShowWelcome(true), DURATION_MS - 1500);

    const finish = window.setTimeout(() => {
      setFadeOut(true);
      window.setTimeout(() => setVisible(false), 500);
    }, DURATION_MS);

    return () => {
      window.clearInterval(slide);
      window.clearTimeout(welcome);
      window.clearTimeout(finish);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden bg-black transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
      aria-hidden="true"
    >
      {IMAGES.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === index ? "opacity-40 scale-105" : "opacity-0"}`}
          style={{ transition: "opacity 700ms ease, transform 4s ease-out" }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
        <img
          src="/logo-compact.png"
          alt="BingBloom"
          className="h-16 w-16 rounded-2xl object-contain shadow-[0_0_28px_rgba(229,9,20,0.45)] animate-[bounce_1.2s_ease-in-out_infinite]"
        />
        {showWelcome ? (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome to <span className="text-primary">BingBloom</span>
            </h1>
            <p className="mt-2 text-sm font-semibold tracking-[0.3em] text-white/80 uppercase">
              Discover • Stream • Bloom
            </p>
          </div>
        ) : (
          <p className="text-xs font-semibold tracking-[0.35em] text-white/70 uppercase">
            Loading BingBloom
          </p>
        )}

        <div className="mt-3 h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-primary"
            style={{ animation: `splash-progress ${DURATION_MS}ms linear forwards` }}
          />
        </div>
      </div>

      <style>{`@keyframes splash-progress { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
};

export default AppSplashScreen;
