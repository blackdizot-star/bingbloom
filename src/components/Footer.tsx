import { Link } from "react-router-dom";
import { Globe } from "lucide-react";

const COLS = [
  {
    title: "Company",
    links: [
      { label: "About / Corporate", to: "/corporate" },
      { label: "Investor Relations", to: "/investors" },
      { label: "Jobs", to: "/jobs" },
      { label: "Media Center", to: "/media" },
      { label: "Only on BingBloom", to: "/only-on-bingbloom" },
    ],
  },
  {
    title: "Watch",
    links: [
      { label: "Ways to Watch", to: "/ways-to-watch" },
      { label: "Check for update", to: "https://whatsapp.com/channel/0029VbD2CdHEwEjtJ5Utbo2n" },
      { label: "Download APK", to: "/download-apk" },
      { label: "Speed Test", to: "/speed-test" },
      { label: "Follow Us", to: "/follow-us" },
      { label: "Account", to: "/profile" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Help Center", to: "/help" },
      { label: "FAQ", to: "/faq" },
      { label: "FAQs & Questions", to: "/faqs" },
      { label: "Movie FAQ", to: "/movie-faq" },
      { label: "Contact Us", to: "/contact" },
      { label: "Redeem Gift Cards", to: "/redeem" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Use", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Cookie Preferences", to: "/cookie-preferences" },
      { label: "Advert Choices", to: "/ad-choices" },
      { label: "Legal Notices", to: "/legal-notices" },
      { label: "Legal Guarantee", to: "/legal-guarantee" },
    ],
  },
];

const Footer = () => (
  <footer className="border-t border-white/10 bg-black/95 text-white/55 pb-20 md:pb-6">
    <div className="max-w-6xl mx-auto px-5 pt-4">
      <a href="mailto:hello.bingbloom@gmail.com" className="text-[12px] underline hover:text-white">
        Questions? Email hello.bingbloom@gmail.com
      </a>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-5 mt-5 text-[12px]">
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-[10.5px] uppercase tracking-widest text-white/40 mb-2">{col.title}</h4>
            <ul className="space-y-1.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.to && l.to.startsWith("http") ? (
                    <a href={l.to} target="_blank" rel="noreferrer" className="hover:text-white hover:underline transition-colors">{l.label}</a>
                  ) : (
                    <Link to={l.to} className="hover:text-white hover:underline transition-colors">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <button className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/20 rounded text-[11px] text-white">
          <Globe className="w-3 h-3" /> English
        </button>
      </div>

      <p className="mt-5 text-[10.5px] text-white/45">
        BingBloom Inc. · 811 Grand St, Alameda, CA 94501, USA
      </p>
      <p className="mt-1 text-[10.5px] text-white/40">
        © {new Date().getFullYear()} BingBloom Inc. All rights reserved. Stream. Discover. Bloom.
      </p>
    </div>
  </footer>
);

export default Footer;
