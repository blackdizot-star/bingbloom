import { Link, useNavigate } from "react-router-dom";
import { Home, Compass, Film } from "lucide-react";
import SEO from "@/components/SEO";

const SUGGESTIONS = [
  { label: "Trending now", to: "/movies", icon: Film },
  { label: "Explore catalog", to: "/search", icon: Compass },
  { label: "Back to home", to: "/", icon: Home },
];

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#000" }}>
      <SEO
        title="Content not found – MovieNoir"
        description="We couldn't find that page on MovieNoir. Try one of our suggestions to keep watching."
        noindex
      />
      <div className="text-center px-6 max-w-sm w-full animate-fade-in">
        <img
          src={"/logo-compact.png"}
          alt="MovieNoir"
          className="w-20 h-20 mx-auto mb-5 rounded-2xl shadow-[0_0_40px_rgba(255,45,143,0.35)]"
        />
        <h1 className="text-xl font-bold text-white mb-2">Sorry, content not found</h1>
        <p className="text-sm text-white/60 mb-6">
          The page or title you were looking for isn't here. Try one of these instead:
        </p>
        <div className="flex flex-col gap-2.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.to}
              onClick={() => navigate(s.to)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              style={{ background: "#FF2D8F" }}
            >
              <s.icon className="w-4 h-4" /> {s.label}
            </button>
          ))}
        </div>
        <Link to="/" className="block mt-6 text-xs text-white/40 hover:text-white/70">
          MovieNoir &mdash; stream movies & series
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
