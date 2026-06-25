import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const KEY = "bb_cookie_consent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {}
  }, []);

  if (!visible) return null;

  const accept = () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed left-2 right-2 md:left-4 md:right-4 z-[80] bottom-[calc(3.75rem+env(safe-area-inset-bottom))] md:bottom-4"
    >
      <div className="mx-auto max-w-3xl bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3">
        <p className="text-xs md:text-sm text-foreground/90 flex-1">
          We use cookies to improve your experience. By using our site, you accept our cookie policy.
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to="/privacy"
            className="px-3 py-1.5 text-xs md:text-sm rounded-md border border-border text-foreground/80 hover:bg-secondary"
          >
            Learn More
          </Link>
          <button
            onClick={accept}
            className="px-4 py-1.5 text-xs md:text-sm rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90"
          >
            Accept
          </button>
          <button
            onClick={accept}
            aria-label="Dismiss"
            className="md:hidden p-1 text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
