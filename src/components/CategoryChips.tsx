import { Link, useLocation } from "react-router-dom";

const chips = [
  { to: "/home", label: "Trending" },
  { to: "/movies", label: "Movies" },
  { to: "/tv", label: "TV" },
  { to: "/anime", label: "Anime" },
  { to: "/animation", label: "Animation" },
  { to: "/documentary", label: "Docs" },
  { to: "/live-tv", label: "Live" },
  { to: "/genre/comedy", label: "Comedy" },
  { to: "/genre/action", label: "Action" },
  { to: "/genre/horror", label: "Horror" },
  { to: "/my-downloads", label: "Downloads" },
];

/** Horizontal scrollable chip bar — matches the reference mockups (image 7/13). */
const CategoryChips = () => {
  const { pathname } = useLocation();
  return (
    <div className="relative z-20 border-b border-border/50 bg-background">
      <div className="flex gap-2 overflow-x-auto px-[4%] py-5 scrollbar-hide">
        {chips.map((c) => {
          const active = pathname === c.to;
          return (
            <Link
              key={c.to}
              to={c.to}
              className={`shrink-0 rounded-sm border px-4 py-2 text-[11px] font-semibold whitespace-nowrap transition ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChips;
