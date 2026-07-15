import { Link, useLocation, useNavigate, NavLink } from "react-router-dom";
import { Search, X, Menu, Home, Film, Tv, Clapperboard, Radio, Palette, Camera, User, Mic2, Bookmark, Heart, Settings, Shield, Download } from "lucide-react";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

const primaryNav = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/movies", label: "Movies", icon: Film },
  { to: "/tv", label: "TV Shows", icon: Tv },
  { to: "/anime", label: "Anime", icon: Clapperboard },
  { to: "/animation", label: "Animation", icon: Palette },
  { to: "/documentary", label: "Documentary", icon: Camera },
  { to: "/live-tv", label: "Live TV", icon: Radio },
  { to: "/podcasts", label: "Podcasts", icon: Mic2 },
];

const drawerExtras = [
  { to: "/my-downloads", label: "Downloads", icon: Download },
  { to: "/my-list", label: "Watchlist", icon: Bookmark },
  { to: "/liked", label: "Liked", icon: Heart },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/privacy", label: "Privacy", icon: Shield },
  { to: "/follow-us", label: "Follow Us", icon: Heart },
];

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const isHome = location.pathname === "/home" || location.pathname === "/";
  const bgClass = scrolled || !isHome
    ? "bg-background/95 backdrop-blur-md border-b border-border/60"
    : "bg-gradient-to-b from-background/90 to-transparent";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${bgClass}`}>
        <div className="flex items-center gap-2 md:gap-3 px-2 md:px-6 h-12 md:h-14 max-w-[1600px] mx-auto">
          {/* Hamburger on the LEFT (mobile) */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="md:hidden grid place-items-center h-8 w-8 rounded-md text-foreground/80 hover:text-primary flex-shrink-0"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          {/* Logo */}
          <Link to="/home" className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <img
              src={"/logo-compact.png"}
              alt="BingBloom"
              className="h-7 w-7 md:h-8 md:w-8"
              style={{ filter: "drop-shadow(0 0 8px rgba(229,9,20,0.55))" }}
            />
            <span className="hidden sm:inline text-base font-extrabold text-gradient-bb tracking-tight">BingBloom</span>
          </Link>

          {/* Desktop horizontal nav — centered */}
          <nav className="hidden md:flex items-center gap-0.5 mx-auto overflow-x-auto scrollbar-hide">
            {primaryNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop search input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="hidden md:flex md:w-56"
          >
            <div className="flex w-full items-center rounded-full bg-secondary/70 px-3 py-1.5 ring-1 ring-transparent focus-within:ring-primary">
              <Search className="mr-2 h-3.5 w-3.5 text-foreground/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-xs md:text-sm outline-none placeholder:text-foreground/50"
              />
            </div>
          </form>

          {/* Spacer for mobile to push right cluster */}
          <div className="flex-1 md:hidden" />

          {/* Right cluster — mobile: install, search, profile, settings (rightmost) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href="https://bingbloomdownload.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-[0_2px_8px_rgba(229,9,20,0.45)]"
              aria-label="Install BingBloom app"
            >
              <Download className="h-3 w-3" /> Install
            </a>
            <a
              href="https://bingbloomdownload.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground shadow-[0_2px_10px_rgba(229,9,20,0.45)] hover:brightness-110"
              aria-label="Install BingBloom app on desktop"
            >
              <Download className="h-3.5 w-3.5" /> Install App
            </a>
            <Link
              to="/search"
              aria-label="Search"
              className="md:hidden grid place-items-center h-8 w-8 rounded-full bg-secondary/70 text-foreground/80 hover:text-primary"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              to="/profile"
              aria-label="Profile"
              className="grid place-items-center h-8 w-8 rounded-full bg-secondary/70 text-foreground/80 hover:text-primary"
            >
              <User className="h-4 w-4" />
            </Link>
            <Link
              to="/my-downloads"
              aria-label="Downloads"
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[12px] font-semibold text-foreground/80 hover:text-foreground hover:bg-secondary/60"
            >
              <Download className="h-3.5 w-3.5" /> Downloads
            </Link>
            <div className="hidden md:block"><ThemeToggle /></div>
            <Link
              to="/settings"
              aria-label="Settings"
              className="md:hidden grid place-items-center h-8 w-8 rounded-full bg-secondary/70 text-foreground/80 hover:text-primary"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>


      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 z-[70] w-[82%] max-w-[300px] bg-card shadow-2xl flex flex-col animate-slide-in-right" style={{ animation: "slide-in-right 0.3s ease-out reverse" }}>
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <Link to="/home" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2">
                <img src={"/logo-compact.png"} alt="" className="w-8 h-8" style={{ filter: "drop-shadow(0 0 6px rgba(229,9,20,0.6))" }} />
                <span className="text-base font-extrabold text-gradient-bb">BingBloom</span>
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg hover:bg-secondary"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-0.5">
              {primaryNav.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium min-h-[44px] ${
                      active ? "bg-primary/15 text-primary" : "text-foreground/80 hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    {label}
                  </Link>
                );
              })}
              <div className="h-px bg-border my-2" />
              {drawerExtras.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground/80 hover:bg-secondary min-h-[44px]"
                >
                  <Icon className="w-[18px] h-[18px]" /> {label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-foreground/80">Theme</span>
                <ThemeToggle />
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  );
};

export default TopBar;
