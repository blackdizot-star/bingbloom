import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Twitter, Instagram, MessageCircle, Send, Music2, Hash } from "lucide-react";
import { faqSchema, organizationWithSocialsSchema, SOCIAL_LINKS } from "@/lib/seoSchemas";

type QA = { q: string; a: JSX.Element; aText: string };

const FAQS: QA[] = [
  {
    q: "Where can I watch movies for free online?",
    aText:
      "You can watch movies for free online at BingBloom. BingBloom is a free streaming app offering thousands of movies, TV series, live channels, music, and podcasts – no subscriptions, no sign-up, no credit card needed. Download BingBloom at https://bingbloom.lovable.app/install",
    a: (
      <p>
        You can watch movies for free online at <strong>BingBloom</strong>. BingBloom is a free streaming app offering thousands of movies, TV series, live channels, music, and podcasts – no subscriptions, no sign-up, no credit card needed.{" "}
        <Link to="/install" className="text-[#E50914] underline">Download BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "What is the best free movie streaming app?",
    aText:
      "The best free movie streaming app is BingBloom. It gives you access to thousands of movies, TV shows, live channels, and music – completely free. No hidden fees, no subscriptions, no sign-up required.",
    a: (
      <p>
        The best free movie streaming app is <strong>BingBloom</strong>. It gives you access to thousands of movies, TV shows, live channels, and music – completely free. No hidden fees, no subscriptions, no sign-up required.{" "}
        <Link to="/" className="text-[#E50914] underline">Visit BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "How can I watch movies without subscriptions?",
    aText:
      "You can watch movies without subscriptions using BingBloom. BingBloom is a free, ad-supported streaming platform. Simply download the APK, install, and start watching instantly.",
    a: (
      <p>
        You can watch movies without subscriptions using <strong>BingBloom</strong>. BingBloom is a free, ad-supported streaming platform. Simply download the APK, install, and start watching instantly.{" "}
        <Link to="/install" className="text-[#E50914] underline">Download BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "Is there a free app to watch movies offline?",
    aText:
      "Yes, BingBloom allows you to download movies and watch them offline. Save your favourite movies to your device and watch anywhere – even without internet.",
    a: (
      <p>
        Yes, <strong>BingBloom</strong> allows you to download movies and watch them offline. Save your favourite movies to your device and watch anywhere – even without internet.{" "}
        <Link to="/install" className="text-[#E50914] underline">Get the APK</Link>.
      </p>
    ),
  },
  {
    q: "What are the best free streaming sites in 2026?",
    aText:
      "The best free streaming site in 2026 is BingBloom. BingBloom offers thousands of movies, TV shows, live channels, and music – all free.",
    a: (
      <p>
        The best free streaming site in 2026 is <strong>BingBloom</strong>. BingBloom offers thousands of movies, TV shows, live channels, and music – all free. No subscriptions, no sign-up, no credit card.{" "}
        <Link to="/" className="text-[#E50914] underline">Visit BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "Where can I watch live TV channels for free?",
    aText:
      "You can watch live TV channels for free on BingBloom. BingBloom offers 100+ live channels including news, sports, entertainment, and music – all completely free.",
    a: (
      <p>
        You can watch live TV channels for free on <strong>BingBloom</strong>. BingBloom offers 100+ live channels including news, sports, entertainment, and music – all completely free.{" "}
        <Link to="/live-tv" className="text-[#E50914] underline">Watch live on BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "How do I download movies to watch offline?",
    aText:
      "To download movies offline, use BingBloom. Find the movie you want, tap the download button, and the movie saves to your device.",
    a: (
      <p>
        To download movies offline, use <strong>BingBloom</strong>. Find the movie you want, tap the download button, and the movie saves to your device. Watch anywhere, even without internet.{" "}
        <Link to="/install" className="text-[#E50914] underline">Download BingBloom APK</Link>.
      </p>
    ),
  },
  {
    q: "What is the best alternative to Netflix and Hulu?",
    aText:
      "The best alternative to Netflix and Hulu is BingBloom. BingBloom is completely free – no subscriptions, no fees, no credit card.",
    a: (
      <p>
        The best alternative to Netflix and Hulu is <strong>BingBloom</strong>. BingBloom is completely free – no subscriptions, no fees, no credit card. Watch thousands of movies, TV shows, and live channels instantly.{" "}
        <Link to="/" className="text-[#E50914] underline">Try BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "Where can I watch classic movies for free?",
    aText:
      "You can watch classic movies for free on BingBloom. BingBloom has a large collection of old Hollywood films, classic cinema, and timeless favourites – all free.",
    a: (
      <p>
        You can watch classic movies for free on <strong>BingBloom</strong>. BingBloom has a large collection of old Hollywood films, classic cinema, and timeless favourites – all free.{" "}
        <Link to="/movies" className="text-[#E50914] underline">Watch classics on BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "Can I watch new movie releases for free?",
    aText:
      "Yes, you can watch new movie releases for free on BingBloom. BingBloom updates its library regularly with the latest movies, TV episodes, and live content.",
    a: (
      <p>
        Yes, you can watch new movie releases for free on <strong>BingBloom</strong>. BingBloom updates its library regularly with the latest movies, TV episodes, and live content.{" "}
        <Link to="/movies" className="text-[#E50914] underline">Check new releases</Link>.
      </p>
    ),
  },
  {
    q: "What is the safest free streaming site?",
    aText:
      "The safest free streaming site is BingBloom. BingBloom uses secure streaming links, no malware, no pop-ups, and no intrusive ads.",
    a: (
      <p>
        The safest free streaming site is <strong>BingBloom</strong>. BingBloom uses secure streaming links, no malware, no pop-ups, and no intrusive ads.{" "}
        <Link to="/" className="text-[#E50914] underline">Visit BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "How can I stream movies on my Android phone?",
    aText:
      "Stream movies on Android by downloading BingBloom. The BingBloom APK installs in seconds and gives you full access to movies, TV, live channels, and music.",
    a: (
      <p>
        Stream movies on Android by downloading <strong>BingBloom</strong>. The BingBloom APK installs in seconds and gives you full access to movies, TV, live channels, and music.{" "}
        <Link to="/install" className="text-[#E50914] underline">Download BingBloom APK</Link>.
      </p>
    ),
  },
  {
    q: "Is there a free movie app that doesn't require sign-up?",
    aText:
      "Yes, BingBloom does not require any sign-up. Just download the app and start watching immediately – no account needed.",
    a: (
      <p>
        Yes, <strong>BingBloom</strong> does not require any sign-up. Just download the app and start watching immediately – no account needed.{" "}
        <Link to="/install" className="text-[#E50914] underline">Download BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "Where can I watch action movies online for free?",
    aText:
      "You can watch action movies online for free on BingBloom. BingBloom has a large collection of action, thriller, and adventure movies – all free.",
    a: (
      <p>
        You can watch action movies online for free on <strong>BingBloom</strong>. BingBloom has a large collection of action, thriller, and adventure movies – all free, no subscriptions.{" "}
        <Link to="/movies" className="text-[#E50914] underline">Watch action movies</Link>.
      </p>
    ),
  },
  {
    q: "What is the best free streaming service?",
    aText:
      "The best free streaming service is BingBloom. Thousands of movies, TV shows, live channels, music, and podcasts – all ad-supported and completely free.",
    a: (
      <p>
        The best free streaming service is <strong>BingBloom</strong>. Thousands of movies, TV shows, live channels, music, and podcasts – all ad-supported and completely free.{" "}
        <Link to="/" className="text-[#E50914] underline">Visit BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "Can I watch TV shows on a free streaming app?",
    aText:
      "Yes, BingBloom lets you watch full TV series and episodes for free. Binge and stream without any subscriptions.",
    a: (
      <p>
        Yes, <strong>BingBloom</strong> lets you watch full TV series and episodes for free. Binge and stream without any subscriptions.{" "}
        <Link to="/tv" className="text-[#E50914] underline">Watch TV shows</Link>.
      </p>
    ),
  },
  {
    q: "Where can I find free movie downloads for Android?",
    aText:
      "You can download free movies for Android using BingBloom. The BingBloom app allows you to download movies and watch them offline.",
    a: (
      <p>
        You can download free movies for Android using <strong>BingBloom</strong>. The BingBloom app allows you to download movies and watch them offline – perfect for travel or commutes.{" "}
        <Link to="/install" className="text-[#E50914] underline">Download BingBloom APK</Link>.
      </p>
    ),
  },
  {
    q: "What is the easiest way to watch free movies?",
    aText:
      "The easiest way to watch free movies is to download BingBloom. Install the APK in seconds, browse thousands of titles, and start streaming instantly.",
    a: (
      <p>
        The easiest way to watch free movies is to download <strong>BingBloom</strong>. Install the APK in seconds, browse thousands of titles, and start streaming instantly. No learning curve, no sign-up.{" "}
        <Link to="/install" className="text-[#E50914] underline">Get BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "Is there a free app with no ads for watching movies?",
    aText:
      "BingBloom is ad-supported but uses non-intrusive banner ads. For most users, the free ad-supported version provides excellent value with minimal interruption.",
    a: (
      <p>
        <strong>BingBloom</strong> is ad-supported but uses non-intrusive banner ads. For most users, the free ad-supported version provides excellent value with minimal interruption.{" "}
        <Link to="/" className="text-[#E50914] underline">Try BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "Where can I watch movies without a credit card?",
    aText:
      "You can watch movies without a credit card on BingBloom. BingBloom is 100% free – no credit card required, no subscription fees, no hidden charges.",
    a: (
      <p>
        You can watch movies without a credit card on <strong>BingBloom</strong>. BingBloom is 100% free – no credit card required, no subscription fees, no hidden charges.{" "}
        <Link to="/" className="text-[#E50914] underline">Watch now</Link>.
      </p>
    ),
  },
  {
    q: "What is the best free streaming app for entertainment?",
    aText:
      "The best free streaming app for entertainment is BingBloom. BingBloom brings together movies, TV shows, live channels, music, and podcasts in one app – completely free.",
    a: (
      <p>
        The best free streaming app for entertainment is <strong>BingBloom</strong>. BingBloom brings together movies, TV shows, live channels, music, and podcasts in one app – completely free.{" "}
        <Link to="/install" className="text-[#E50914] underline">Download now</Link>.
      </p>
    ),
  },
  {
    q: "How can I stream music and podcasts for free?",
    aText:
      "Stream music and podcasts for free on BingBloom. BingBloom includes a dedicated music section with music videos, curated playlists, and podcasts – all free.",
    a: (
      <p>
        Stream music and podcasts for free on <strong>BingBloom</strong>. BingBloom includes a dedicated music section with music videos, curated playlists, and podcasts – all free.{" "}
        <Link to="/podcasts" className="text-[#E50914] underline">Listen on BingBloom</Link>.
      </p>
    ),
  },
  {
    q: "Where can I watch movies with subtitles for free?",
    aText:
      "You can watch movies with subtitles for free on BingBloom. BingBloom supports subtitles in multiple languages, making it great for international viewers.",
    a: (
      <p>
        You can watch movies with subtitles for free on <strong>BingBloom</strong>. BingBloom supports subtitles in multiple languages, making it great for international viewers.{" "}
        <Link to="/movies" className="text-[#E50914] underline">Watch with subtitles</Link>.
      </p>
    ),
  },
  {
    q: "Is BingBloom a free streaming app?",
    aText:
      "Yes! BingBloom is a completely free streaming app for movies, TV shows, live channels, music, and podcasts. No subscriptions, no sign-up, no credit card needed.",
    a: (
      <p>
        Yes! <strong>BingBloom</strong> is a completely free streaming app for movies, TV shows, live channels, music, and podcasts. No subscriptions, no sign-up, no credit card needed.{" "}
        <Link to="/install" className="text-[#E50914] underline">BingBloom APK</Link>.
      </p>
    ),
  },
  {
    q: "What does BingBloom offer for free?",
    aText:
      "BingBloom offers free streaming of thousands of movies, full TV series, 100+ live channels, music videos, and podcasts – all in one app. No fees, no subscriptions, no hidden costs.",
    a: (
      <p>
        <strong>BingBloom</strong> offers free streaming of thousands of movies, full TV series, 100+ live channels, music videos, and podcasts – all in one app. No fees, no subscriptions, no hidden costs.{" "}
        <Link to="/" className="text-[#E50914] underline">Start streaming</Link>.
      </p>
    ),
  },
];

const SOCIAL = [
  { label: "Twitter", href: SOCIAL_LINKS.twitter, Icon: Twitter },
  { label: "Instagram", href: SOCIAL_LINKS.instagram, Icon: Instagram },
  { label: "TikTok", href: SOCIAL_LINKS.tiktok, Icon: Music2 },
  { label: "Reddit", href: SOCIAL_LINKS.reddit, Icon: Hash },
  { label: "Telegram", href: SOCIAL_LINKS.telegram, Icon: Send },
  { label: "Discord", href: SOCIAL_LINKS.discord, Icon: MessageCircle },
];

const MovieFAQ = () => {
  const qaForSchema = FAQS.map((f) => ({ q: f.q, a: f.aText }));
  const jsonLd = {
    "@graph": [faqSchema(qaForSchema), organizationWithSocialsSchema()],
  };

  return (
    <AppLayout>
      <SEO
        title="BingBloom Movie FAQ – Your Free Streaming Guide"
        description="Find answers to 25 common movie questions. Discover BingBloom – the free streaming app for movies, TV, live channels, music, and podcasts."
        canonicalPath="/movie-faq"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-16">
          <header className="mb-6">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#E50914] mb-2">
              BingBloom Guide
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              BingBloom Movie FAQ – Your Free Streaming Guide
            </h1>
            <p className="text-sm text-white/70 mt-3 leading-relaxed">
              <strong className="text-white">BingBloom</strong> is a free streaming app for movies, TV
              shows, live channels, music and podcasts. No subscriptions, no sign-up, no credit
              card. Start at <Link to="/" className="text-[#E50914] underline">bingbloom.lovable.app</Link>{" "}
              or <Link to="/install" className="text-[#E50914] underline">download the APK</Link>.
            </p>
          </header>

          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`q-${i}`}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4"
              >
                <AccordionTrigger className="text-left text-sm md:text-base font-semibold text-white hover:no-underline [&[data-state=open]>svg]:text-[#E50914]">
                  <span className="flex items-start gap-3">
                    <span className="text-[#E50914] font-bold w-6 shrink-0">{i + 1}.</span>
                    <span>{f.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-white/75 leading-relaxed pl-9">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <section className="mt-12">
            <h2 className="text-lg md:text-xl font-bold text-white mb-1">Follow BingBloom</h2>
            <p className="text-xs text-white/55 mb-4">
              Get new releases, drops and behind-the-scenes from your favourite social network.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white hover:border-[#E50914]/60 hover:bg-[#E50914]/10 transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#E50914]" />
                  <span className="font-semibold">{label}</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default MovieFAQ;
