import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Shield, Monitor, Tv2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import SEO from "@/components/SEO";
import { isOnboarded } from "@/lib/onboarding";


const Welcome = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (isOnboarded()) navigate("/home", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 pt-10 pb-6 relative overflow-hidden">
      <SEO title="Welcome to BingBloom" description="Stream movies, TV shows, anime and live channels — free, ad-supported." />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(229,9,20,0.25) 0%, transparent 60%)" }} />

      <div className="relative flex-1 flex flex-col items-center justify-center text-center">
        <BrandLogo size={64} wordmarkSize="md" />
        <p className="mt-2 text-[9px] tracking-[0.32em] font-semibold">
          <span className="text-white">STREAM.</span> <span className="text-white">DISCOVER.</span> <span style={{ color: "#E50914" }}>BLOOM.</span>
        </p>
        <p className="mt-2 text-[11px] text-white/65 leading-relaxed max-w-xs">
          Thousands of movies, TV series, anime and live channels — free, on every device.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-sm">
          {[
            { icon: Tv2, label: "HD streaming" },
            { icon: Shield, label: "Secure" },
            { icon: Monitor, label: "Any device" },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <f.icon className="w-4 h-4 text-[#E50914]" strokeWidth={1.7} />
              <p className="text-[9.5px] text-white/70 mt-1">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col gap-2">
        <button
          onClick={() => navigate("/onboarding/genres")}
          className="w-full h-10 rounded-lg text-white font-semibold text-xs flex items-center justify-center gap-2 relative"
          style={{ background: "linear-gradient(180deg,#FF1A26 0%,#E50914 100%)", boxShadow: "0 4px 14px rgba(229,9,20,0.35)" }}
        >
          Get Started
          <ChevronRight className="w-4 h-4 absolute right-4" />
        </button>
        <button onClick={() => navigate("/home")} className="w-full h-10 rounded-lg border border-white/15 bg-white/[0.03] text-white text-xs font-medium">
          Skip for now
        </button>
        <div className="flex items-center justify-center gap-3 text-[10px] text-white/45 mt-3 flex-wrap">
          <Link to="/privacy" className="hover:text-white">Privacy</Link>
          <span className="opacity-30">|</span>
          <Link to="/terms" className="hover:text-white">Terms</Link>
          <span className="opacity-30">|</span>
          <Link to="/help" className="hover:text-white">Help</Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
