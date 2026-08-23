import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import { ExternalLink } from "lucide-react";

// Official brand SVGs (inline, monochrome safe — colored via wrapper bg)
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
    <path d="M19.6 6.3a4.7 4.7 0 0 1-3.3-1.7V15a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.8a2.9 2.9 0 1 0 2 2.8V2h2.8a4.7 4.7 0 0 0 3.3 4.3V6.3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.3-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.4 5L2 22l5.2-1.4c1.4.8 3 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
  </svg>
);

const socials = [
  { name: "TikTok", handle: "@bing_bloom", url: "https://www.tiktok.com/@bing_bloom", Icon: TikTokIcon, bg: "linear-gradient(135deg,#25F4EE 0%,#000 50%,#FE2C55 100%)" },
  { name: "Instagram", handle: "@bingbloom.co", url: "https://instagram.com/bingbloom.co", Icon: InstagramIcon, bg: "linear-gradient(135deg,#F58529 0%,#DD2A7B 40%,#8134AF 70%,#515BD4 100%)" },
  { name: "WhatsApp", handle: "MovieNoir channel", url: "https://whatsapp.com/channel/0029VbD2CdHEwEjtJ5Utbo2n", Icon: WhatsAppIcon, bg: "linear-gradient(135deg,#25D366 0%,#128C7E 100%)" },
];

const FollowUsPage = () => {
  return (
    <AppLayout>
      <SEO title="Follow MovieNoir – Official Social Channels" description="Follow MovieNoir on TikTok, Instagram and WhatsApp for new releases, drops and behind-the-scenes." />
      <div className="px-5 pt-6 pb-12 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Follow MovieNoir</h1>
        <p className="text-xs text-muted-foreground mt-1 mb-6">
          Official channels — new releases, features and community updates.
        </p>

        <div className="space-y-2.5">
          {socials.map(({ name, handle, url, Icon, bg }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: bg }}>
                <Icon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground leading-tight">{name}</h3>
                <p className="text-[11px] text-muted-foreground">{handle}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-semibold">
                Follow <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground mt-6 text-center">© MovieNoir Studios — Stream. Discover. Bloom.</p>
      </div>
    </AppLayout>
  );
};

export default FollowUsPage;
