import { useEffect, useState } from "react";
import { Share2, Film, Users, Star, Gift, Check } from "lucide-react";
import { Link } from "react-router-dom";

interface Challenge {
  id: string;
  icon: typeof Share2;
  title: string;
  prize: string;
  action: { label: string; href?: string; onClick?: () => void };
}

const STORAGE_KEY = "daily_challenges_v1";

const useCompleted = () => {
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const complete = (id: string) => {
    const next = { ...done, [id]: true };
    setDone(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  return { done, complete };
};

const DailyChallenge = () => {
  const { done, complete } = useCompleted();
  const [shareSupported, setShareSupported] = useState(false);
  useEffect(() => setShareSupported(typeof navigator !== "undefined" && !!navigator.share), []);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "MovieNoir",
          text: "Stream free movies, TV & live channels on MovieNoir!",
          url: window.location.origin,
        });
        complete("share");
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        complete("share");
      }
    } catch {}
  };

  const challenges: Challenge[] = [
    {
      id: "share",
      icon: Share2,
      title: "Share MovieNoir with a friend",
      prize: "Ad-free for 1 hour",
      action: { label: "Share", onClick: handleShare },
    },
    {
      id: "watch5",
      icon: Film,
      title: "Watch 5 movies today",
      prize: "Unlock 1 free download",
      action: { label: "Browse", href: "/movies" },
    },
    {
      id: "follow",
      icon: Users,
      title: "Follow us on socials",
      prize: "200 Bloom points",
      action: { label: "Follow", href: "/follow-us" },
    },
    {
      id: "rate",
      icon: Star,
      title: "Rate any title",
      prize: "50 Bloom points",
      action: { label: "Rate", href: "/movies" },
    },
    {
      id: "explore",
      icon: Gift,
      title: "Explore a new category",
      prize: "Surprise reward",
      action: { label: "Explore", href: "/search" },
    },
  ];

  return (
    <section className="px-[4%] my-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-sm bg-[#FF2D8F]" />
          Daily Challenges
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Earn rewards
        </span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-[4%] px-[4%] pb-1.5">
        {challenges.map((c) => {
          const Icon = c.icon;
          const isDone = !!done[c.id];
          return (
            <div
              key={c.id}
              className="min-w-[200px] max-w-[200px] rounded-xl border border-white/10 p-3 flex flex-col gap-2"
              style={{
                background:
                  "linear-gradient(140deg, rgba(255,45,143,0.18), rgba(20,20,20,0.85) 60%)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-[#FF2D8F]/20 text-[#FF2D8F]">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                {isDone && (
                  <span className="text-[9px] uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Done
                  </span>
                )}
              </div>
              <p className="text-[12px] font-semibold text-foreground leading-snug line-clamp-2">
                {c.title}
              </p>
              <p className="text-[10px] text-amber-300/90 flex items-center gap-1">
                <Gift className="w-3 h-3" /> {c.prize}
              </p>
              {c.action.href ? (
                <Link
                  to={c.action.href}
                  onClick={() => complete(c.id)}
                  className="mt-auto text-center text-[11px] font-semibold py-1.5 rounded-md bg-white/10 hover:bg-[#FF2D8F] hover:text-white transition"
                >
                  {isDone ? "Claimed" : c.action.label}
                </Link>
              ) : (
                <button
                  onClick={c.action.onClick}
                  className="mt-auto text-center text-[11px] font-semibold py-1.5 rounded-md bg-white/10 hover:bg-[#FF2D8F] hover:text-white transition"
                >
                  {isDone ? "Claimed" : c.action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DailyChallenge;
