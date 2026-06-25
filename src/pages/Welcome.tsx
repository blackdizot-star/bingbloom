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

  const features = [
    { icon: Tv2, label: "HD streaming" },
    { icon: Shield, label: "Secure" },
    { icon: Monitor, label: "Any device" },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col md:flex-row md:items-stretch">
      <SEO title="Welcome to BingBloom" description="Stream movies, TV shows, anime and live channels — free, ad-supported." />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(229,9,20,0.25) 0%, transparent 60%)" }} />

      {/* Desktop-only cinematic brand panel (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative items-center justify-center p-12 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at 30% 30%, rgba(229,9,20,0.35) 0%, transparent 55%), linear-gradient(135deg,#120406 0%,#000 70%)" }}
        />
        <div className="relative max-w-lg">
          <BrandLogo size={96} wordmarkSize="lg" />
          <p className="mt-4 text-xs tracking-[0.4em] font-semibold">
            <span className="text-white">STREAM.</span> <span className="text-white">DISCOVER.</span> <span style={{ color: "#E50914" }}>BLOOM.</span>
          </p>
          <h2 className="mt-6 text-4xl font-bold leading-tight">
            Thousands of movies, series, anime & live channels.
          </h2>
          <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-md">
            Free, ad-supported, and available on every device. Pick up where you left off and discover something new every day.
          </p>
          <div className="mt-8 flex gap-8">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <f.icon className="w-5 h-5 text-[#E50914]" strokeWidth={1.7} />
                <p className="text-sm text-white/75">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shared content — mobile-centered, desktop right action column */}
      <div className="relative flex-1 flex flex-col px-6 pt-10 pb-6 md:px-12 md:py-0 md:w-1/2 lg:w-2/5 md:items-center md:justify-center">
        <div className="w-full md:max-w-sm flex-1 flex flex-col md:flex-none">
          <div className="relative flex-1 flex flex-col items-center justify-center text-center md:hidden">
            <BrandLogo size={64} wordmarkSize="md" />
            <p className="mt-2 text-[9px] tracking-[0.32em] font-semibold">
              <span className="text-white">STREAM.</span> <span className="text-white">DISCOVER.</span> <span style={{ color: "#E50914" }}>BLOOM.</span>
            </p>
            <p className="mt-2 text-[11px] text-white/65 leading-relaxed max-w-xs">
              Thousands of movies, TV series, anime and live channels — free, on every device.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-sm">
              {features.map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <f.icon className="w-4 h-4 text-[#E50914]" strokeWidth={1.7} />
                  <p className="text-[9.5px] text-white/70 mt-1">{f.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block mb-6 text-center">
            <h1 className="text-2xl font-bold">Get started</h1>
            <p className="text-sm text-white/55 mt-1">Set up your experience in under a minute.</p>
          </div>

          <div className="relative flex flex-col gap-2">
            <button
              onClick={() => navigate("/onboarding/genres")}
              className="w-full h-10 md:h-12 rounded-lg text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 relative"
              style={{ background: "linear-gradient(180deg,#FF1A26 0%,#E50914 100%)", boxShadow: "0 4px 14px rgba(229,9,20,0.35)" }}
            >
              Get Started
              <ChevronRight className="w-4 h-4 absolute right-4" />
            </button>
            <button onClick={() => navigate("/home")} className="w-full h-10 md:h-12 rounded-lg border border-white/15 bg-white/[0.03] text-white text-xs md:text-sm font-medium">
              Skip for now
            </button>
            <div className="flex items-center justify-center gap-3 text-[10px] md:text-xs text-white/45 mt-3 flex-wrap">
              <Link to="/privacy" className="hover:text-white">Privacy</Link>
              <span className="opacity-30">|</span>
              <Link to="/terms" className="hover:text-white">Terms</Link>
              <span className="opacity-30">|</span>
              <Link to="/help" className="hover:text-white">Help</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
