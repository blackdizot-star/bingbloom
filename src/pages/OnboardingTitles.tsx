import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StepProgress from "@/components/StepProgress";
import BrandLogo from "@/components/BrandLogo";
import SEO from "@/components/SEO";
import { saveOnboardingStep } from "@/lib/onboarding";

const TITLES = [
  { t: "John Wick", img: "https://image.tmdb.org/t/p/w300/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg" },
  { t: "Stranger Things", img: "https://image.tmdb.org/t/p/w300/49WJfeN0moxb9IPfGn8AIqMGskD.jpg" },
  { t: "The Last of Us", img: "https://image.tmdb.org/t/p/w300/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg" },
  { t: "Avatar", img: "https://image.tmdb.org/t/p/w300/kyeqWdyUXW608qlYkRqosgbbJyK.jpg" },
  { t: "Breaking Bad", img: "https://image.tmdb.org/t/p/w300/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" },
  { t: "Fast & Furious", img: "https://image.tmdb.org/t/p/w300/lUZj2D5Y9pwmJ3MgEYJ7M7G7Itq.jpg" },
  { t: "Money Heist", img: "https://image.tmdb.org/t/p/w300/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg" },
  { t: "Squid Game", img: "https://image.tmdb.org/t/p/w300/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg" },
  { t: "Naruto", img: "https://image.tmdb.org/t/p/w300/xppeysfvDKVx5MsTnJzCFhVAk1F.jpg" },
  { t: "One Piece", img: "https://image.tmdb.org/t/p/w300/cMD9Ygz11zjJzAovURpO75Qg7rT.jpg" },
  { t: "The Boys", img: "https://image.tmdb.org/t/p/w300/stTEycfG9928HYGEISBFaG1ngjM.jpg" },
  { t: "Avengers", img: "https://image.tmdb.org/t/p/w300/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg" },
];

const OnboardingTitles = () => {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (t: string) =>
    setPicked((p) =>
      p.includes(t) ? p.filter((x) => x !== t) : p.length >= 10 ? p : [...p, t],
    );

  const submit = () => {
    if (picked.length < 3) return;
    saveOnboardingStep("titles", picked);
    navigate("/onboarding/done");
  };

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      <SEO title="Personalize – BingBloom" />
      <StepProgress current={3} total={4} />
      <div className="flex flex-col items-center mt-2">
        <BrandLogo size={36} wordmarkSize="sm" />
      </div>

      <div className="px-5 mt-3">
        <h1 className="text-base font-bold text-center leading-tight">
          Help us personalize your experience
        </h1>
        <p className="text-center text-white/55 text-[11px] mt-1">Choose 3–10 titles you love.</p>

        <div className="grid grid-cols-4 gap-2 mt-4 max-w-md mx-auto">
          {TITLES.map((m) => {
            const on = picked.includes(m.t);
            return (
              <button
                key={m.t}
                onClick={() => toggle(m.t)}
                className="aspect-[2/3] rounded-lg overflow-hidden bg-[#0f0f10] relative transition-all"
                style={on ? { boxShadow: "0 0 10px rgba(229,9,20,0.7)", outline: "1.5px solid #E50914" } : { border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <img src={m.img} alt={m.t} className="w-full h-full object-cover" loading="lazy" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/95 to-transparent">
        <button
          onClick={submit}
          disabled={picked.length < 3}
          className="w-full max-w-md mx-auto h-10 rounded-lg text-white text-xs font-semibold flex items-center justify-center relative disabled:opacity-50"
          style={{ background: "linear-gradient(180deg,#FF1A26 0%,#E50914 100%)", boxShadow: "0 4px 14px rgba(229,9,20,0.35)" }}
        >
          Continue ({picked.length} selected)
          <ChevronRight className="w-4 h-4 absolute right-4" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingTitles;
