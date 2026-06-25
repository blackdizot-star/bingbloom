import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StepProgress from "@/components/StepProgress";
import BrandLogo from "@/components/BrandLogo";
import SEO from "@/components/SEO";
import { saveOnboardingStep } from "@/lib/onboarding";

const GENRES = [
  { label: "Action", emoji: "💥" },
  { label: "Romance", emoji: "😍" },
  { label: "Comedy", emoji: "😂" },
  { label: "Horror", emoji: "💀" },
  { label: "Thriller", emoji: "😲" },
  { label: "Sci-Fi", emoji: "🪐" },
  { label: "Superhero", emoji: "🦸" },
  { label: "Anime", emoji: "👧" },
  { label: "Documentary", emoji: "🎥" },
  { label: "Drama", emoji: "😢" },
  { label: "Family", emoji: "👨‍👩‍👧" },
  { label: "Mystery", emoji: "🔍" },
];

const OnboardingGenres = () => {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (g: string) =>
    setPicked((p) => (p.includes(g) ? p.filter((x) => x !== g) : [...p, g]));

  const submit = () => {
    if (picked.length < 5) return;
    saveOnboardingStep("genres", picked);
    navigate("/onboarding/titles");
  };

  return (
    <div className="min-h-screen bg-black text-white pb-10">
      <SEO title="Choose Genres – BingBloom" />
      <StepProgress current={2} />
      <div className="flex flex-col items-center mt-2">
        <BrandLogo size={36} wordmarkSize="sm" />
      </div>

      <div className="px-5 mt-3 md:mt-8">
        <h1 className="text-lg md:text-3xl font-bold text-center leading-tight">
          What do you enjoy watching?
        </h1>
        <p className="text-center text-white/55 text-[11px] md:text-sm mt-1.5">Choose at least 5 genres</p>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 mt-4 md:mt-6 max-w-md md:max-w-4xl mx-auto">
          {GENRES.map((g) => {
            const on = picked.includes(g.label);
            return (
              <button
                key={g.label}
                onClick={() => toggle(g.label)}
                className="aspect-[1.6/1] rounded-lg bg-[#0f0f10] flex flex-col items-center justify-center gap-0.5 transition-all"
                style={
                  on
                    ? {
                        border: "1.5px solid #E50914",
                        boxShadow: "0 0 10px rgba(229,9,20,0.6), inset 0 0 8px rgba(229,9,20,0.18)",
                      }
                    : { border: "1px solid rgba(255,255,255,0.06)" }
                }
              >
                <span className="text-base">{g.emoji}</span>
                <span className="text-[10.5px] font-semibold text-white">{g.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={submit}
          disabled={picked.length < 5}
          className="w-full max-w-md md:max-w-sm mx-auto mt-5 md:mt-8 h-10 md:h-12 rounded-lg text-white text-xs md:text-sm font-semibold flex items-center justify-center relative disabled:opacity-50"
          style={{
            background: "linear-gradient(180deg,#FF1A26 0%,#E50914 100%)",
            boxShadow: "0 4px 14px rgba(229,9,20,0.35)",
          }}
        >
          Continue
          <ChevronRight className="w-4 h-4 absolute right-4" />
        </button>
        <p className="text-center text-[10px] text-white/55 mt-2">Selected {picked.length}/12</p>
      </div>
    </div>
  );
};

export default OnboardingGenres;
