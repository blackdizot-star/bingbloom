import { useNavigate } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";
import StepProgress from "@/components/StepProgress";
import BrandLogo from "@/components/BrandLogo";
import SEO from "@/components/SEO";
import { setOnboarded } from "@/lib/onboarding";

const FEATURES = [
  "Personalized Recommendations",
  "Movies & TV Shows",
  "Anime & Music",
  "Live TV Access",
  "Secure Account Protection",
];

const OnboardingDone = () => {
  const navigate = useNavigate();
  const enter = () => {
    setOnboarded();
    navigate("/home", { replace: true });
  };
  return (
    <div className="min-h-screen bg-black text-white pb-6 relative overflow-hidden">
      <SEO title="Welcome – BingBloom" />
      <StepProgress current={5} showBack={false} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(229,9,20,0.22) 0%, transparent 65%)",
        }}
      />

      <div className="relative px-6 mt-4 md:mt-10 text-center md:max-w-md md:mx-auto">
        <div className="flex justify-center mb-3">
          <BrandLogo size={72} wordmarkSize="md" />
        </div>
        <h2 className="text-base md:text-2xl font-bold mt-2">Welcome to BingBloom</h2>
        <p className="text-[11px] md:text-sm text-white/55 mt-1 max-w-xs md:max-w-sm mx-auto">
          Your account is ready. Personalized recommendations have been prepared for you.
        </p>

        <div className="my-4 flex justify-center">
          <div
            className="w-14 h-14 rounded-full grid place-items-center"
            style={{
              border: "2px solid #E50914",
              boxShadow: "0 0 18px rgba(229,9,20,0.55), inset 0 0 8px rgba(229,9,20,0.35)",
            }}
          >
            <Check className="w-7 h-7 text-[#E50914]" strokeWidth={2.5} />
          </div>
        </div>
        <p className="text-[12px] font-semibold flex items-center gap-1.5 justify-center">
          <Check className="w-3.5 h-3.5 text-[#E50914]" /> Account Created Successfully
        </p>

        <div className="mt-4 max-w-sm mx-auto text-left rounded-lg bg-white/[0.03] border border-white/10 p-3">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2 py-0.5 text-[11px] text-white/80">
              <Check className="w-3 h-3 text-[#E50914]" /> {f}
            </div>
          ))}
        </div>

        <button
          onClick={enter}
          className="w-full max-w-md md:max-w-sm mx-auto mt-5 h-10 md:h-12 rounded-lg text-white text-xs md:text-sm font-semibold flex items-center justify-center relative"
          style={{
            background: "linear-gradient(180deg,#FF1A26 0%,#E50914 100%)",
            boxShadow: "0 4px 14px rgba(229,9,20,0.45)",
          }}
        >
          Enter BingBloom
          <ChevronRight className="w-4 h-4 absolute right-4" />
        </button>
        <p className="text-[10px] text-white/45 mt-2">Start discovering content you'll love.</p>
      </div>
    </div>
  );
};

export default OnboardingDone;
