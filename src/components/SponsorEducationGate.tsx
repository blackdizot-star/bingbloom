import { useEffect, useState } from "react";
import SponsorEducationModal from "./SponsorEducationModal";

const COUNT_KEY = "bb_sponsor_shown_count";
const LAST_KEY = "bb_sponsor_last_shown";
const SESSION_KEY = "bb_sponsor_session_shown";
const MAX_SHOWS = 3;
const MIN_GAP_MS = 24 * 60 * 60 * 1000; // 24h between shows after the first
const DELAY_MS = 30_000;

const readNum = (key: string, store: Storage) => {
  const v = store.getItem(key);
  return v ? Number(v) || 0 : 0;
};

const SponsorEducationGate = () => {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<"education" | "thanks">("education");

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      const count = readNum(COUNT_KEY, localStorage);
      if (count >= MAX_SHOWS) return;
      const last = readNum(LAST_KEY, localStorage);
      if (count > 0 && Date.now() - last < MIN_GAP_MS) return;

      const timer = window.setTimeout(() => {
        setVariant(count === 0 ? "education" : "thanks");
        setOpen(true);
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
          localStorage.setItem(COUNT_KEY, String(count + 1));
          localStorage.setItem(LAST_KEY, String(Date.now()));
        } catch {}
      }, DELAY_MS);

      return () => window.clearTimeout(timer);
    } catch {
      /* storage disabled — silently skip */
    }
  }, []);

  return (
    <SponsorEducationModal
      open={open}
      variant={variant}
      onDismiss={() => setOpen(false)}
    />
  );
};

export default SponsorEducationGate;
