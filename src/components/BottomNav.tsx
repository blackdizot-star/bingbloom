import { Home, Film, Flame, Drama, Bookmark } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { to: "/home", icon: Home, label: "Home", match: (p: string) => p === "/" || p === "/home" },
  { to: "/search", icon: Flame, label: "Explore", match: (p: string) => p.startsWith("/search") },
  { to: "/movies", icon: Film, label: "Movies", match: (p: string) => p.startsWith("/movies") || p.startsWith("/tv") },
  { to: "/anime", icon: Drama, label: "Anime", match: (p: string) => p.startsWith("/anime") },
  { to: "/my-list", icon: Bookmark, label: "Watchlist", match: (p: string) => p.startsWith("/my-list") || p.startsWith("/my-downloads") },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 md:hidden rounded-2xl border border-border bg-card/90 shadow-2xl backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex items-stretch justify-between px-2 py-1">
        {tabs.map((t) => {
          const active = t.match(pathname);
          const Icon = t.icon;
          return (
            <li key={t.to} className="flex-1 min-w-0">
              <Link
                to={t.to}
                className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[10.5px] font-medium transition-colors duration-200 ${
                   active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.2 : 1.7} />
                <span className="truncate max-w-full tracking-tight">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
