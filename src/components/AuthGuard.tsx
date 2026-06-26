import { ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { isOnboarded } from "@/lib/onboarding";

const PUBLIC_PREFIXES = [
  "/welcome",
  "/onboarding/",
  "/faq",
  "/investors",
  "/ways-to-watch",
  "/corporate",
  "/legal-notices",
  "/help",
  "/jobs",
  "/terms",
  "/contact",
  "/only-on-bingbloom",
  "/redeem",
  "/privacy",
  "/speed-test",
  "/ad-choices",
  "/media",
  "/gift-cards",
  "/cookie-preferences",
  "/legal-guarantee",
  "/follow-us",
  "/download-apk",
  "/install",
];

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  if (PUBLIC_PREFIXES.some((p) => location.pathname.startsWith(p))) return <>{children}</>;
  if (!isOnboarded()) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
};

export default AuthGuard;
