import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import InlineAdRow from "./InlineAdRow";
import LazyNativeAd from "./LazyNativeAd";


interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
  hideFooter?: boolean;
}

const NO_END_AD = [
  "/my-downloads", "/profile", "/signin", "/welcome", "/onboarding",
  "/faq", "/investors", "/ways-to-watch", "/corporate", "/legal-notices",
  "/help", "/jobs", "/terms", "/contact", "/only-on-bingbloom",
  "/redeem", "/privacy", "/speed-test", "/ad-choices", "/media",
  "/gift-cards", "/cookie-preferences", "/legal-guarantee", "/follow-us",
  "/install", "/search",
];

// Routes where the desktop sidebar ad rail is hidden (full-bleed watch / player).
const NO_SIDEBAR_AD = ["/watch", "/install", "/search", "/profile"];

const AppLayout = ({ children, hideNav, hideFooter }: AppLayoutProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  if (hideNav) return <>{children}</>;

  const showEndAd = !NO_END_AD.some((p) => pathname.startsWith(p));
  const showSidebarAd = !NO_SIDEBAR_AD.some((p) => pathname.startsWith(p));
  const FOOTER_ROUTES = ["/", "/home", "/settings"];
  const showFooter = !hideFooter && FOOTER_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen bg-bingbloom-app">
      <TopBar />
      <div className="pt-12 md:pt-14" />
      <div className="max-w-[1600px] mx-auto flex">
        <main className="pb-16 md:pb-0 flex-1 min-w-0">
          {children}
          {showEndAd && (
            <section aria-label="Advertisement" className="m-0 p-0 leading-none">
              <InlineAdRow count={4} />
            </section>
          )}
        </main>
        {showSidebarAd && (
          <aside className="hidden lg:block w-72 shrink-0 pr-4 pl-2">
            <div className="sticky top-20 space-y-3 py-4">
              <span className="block text-[9px] uppercase tracking-[0.2em] text-white/40 font-semibold">
                Sponsored
              </span>
              <LazyNativeAd placement="sidebar" compact={false} />
              <LazyNativeAd placement="sidebar-2" compact />
            </div>
          </aside>
        )}
      </div>
      {showFooter && <Footer />}
      <BottomNav />

    </div>
  );
};

export default AppLayout;
