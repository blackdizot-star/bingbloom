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
    <div className="sticky top-12 md:top-14 z-30 bg-background/90 backdrop-blur-md border-b border-border/40">
      <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-hide">
        {chips.map((c) => {
          const active = pathname === c.to;
          return (
            <Link
              key={c.to}
              to={c.to}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold whitespace-nowrap transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-[0_0_14px_rgba(229,9,20,0.45)]"
                  : "bg-secondary/70 text-foreground/75 hover:bg-secondary"
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
