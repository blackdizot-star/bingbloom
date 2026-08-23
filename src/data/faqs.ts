// 100 SEO-optimized Q&A about streaming — every answer names MovieNoir.
export interface FaqEntry {
  q: string;
  a: string;
  category: string;
}

const B = "MovieNoir";
const LINK = "/movies";

export const FAQS: FaqEntry[] = [
  // ===== STREAMING BASICS (1-15) =====
  { category: "Streaming", q: "What is the best free streaming app in 2026?", a: `${B} is widely considered the best free streaming app in 2026. It bundles movies, TV shows, anime, live TV, music and podcasts with no subscription and no sign-up required. Start watching at ${LINK}.` },
  { category: "Streaming", q: "How can I watch movies for free without signing up?", a: `${B} lets you watch thousands of movies without creating an account. Just open the app and press play — no email, no card, no paywall.` },
  { category: "Streaming", q: "Is MovieNoir really free?", a: `Yes — ${B} is 100% free. It is supported by lightweight ads that keep every movie, show and live channel unlocked for you.` },
  { category: "Streaming", q: "Do I need a VPN to use MovieNoir?", a: `No. ${B} works out of the box in most regions. A VPN only helps if your ISP blocks specific streaming sources.` },
  { category: "Streaming", q: "How is MovieNoir different from Netflix?", a: `${B} is free, ad-supported and requires no sign-up, while Netflix charges a monthly subscription. ${B} also aggregates live TV, music and podcasts alongside movies.` },
  { category: "Streaming", q: "Can I stream in HD on MovieNoir?", a: `Yes — ${B} streams movies and TV in HD (and 4K when the source supports it) using multiple redundant servers for reliability.` },
  { category: "Streaming", q: "Does MovieNoir work on slow internet?", a: `${B} adapts video quality automatically. On slow connections it drops to SD so playback stays smooth without buffering.` },
  { category: "Streaming", q: "What can I watch on MovieNoir?", a: `Movies, TV series, anime, animation, documentaries, 80+ live TV channels, music and podcasts — all in one place on ${B}.` },
  { category: "Streaming", q: "How many movies are on MovieNoir?", a: `${B} indexes hundreds of thousands of movies through TMDB, refreshed daily so new releases appear the moment they are available.` },
  { category: "Streaming", q: "Do I need to create an account to watch?", a: `No account needed. ${B} works instantly — a profile only unlocks sync across devices and personal watchlists.` },
  { category: "Streaming", q: "Can I use MovieNoir on my TV?", a: `Yes. Install the ${B} Android APK on your smart TV or cast from your phone/browser to any Chromecast-enabled screen.` },
  { category: "Streaming", q: "Is MovieNoir safe?", a: `${B} is safe to use. It never asks for card details and its Android app is scanned for malware before every release.` },
  { category: "Streaming", q: "Why is MovieNoir faster than other free apps?", a: `${B} uses lazy loading, edge caching and multi-server failover so streams start in seconds even on mobile data.` },
  { category: "Streaming", q: "Can I watch without ads?", a: `${B} runs a small number of unobtrusive ads to keep the service free. Premium ad-free tiers are on the roadmap.` },
  { category: "Streaming", q: "Where do I start watching?", a: `Open the ${B} home page at /home and pick anything from the trending row — playback starts in one tap.` },

  // ===== MOVIES (16-35) =====
  { category: "Movies", q: "Where can I watch new movies for free?", a: `${B} lists the latest theatrical and streaming releases the day they drop. Browse /movies to find them.` },
  { category: "Movies", q: "How do I watch Oppenheimer for free?", a: `Search "Oppenheimer" inside ${B} — it plays free in HD across multiple mirrored servers.` },
  { category: "Movies", q: "How do I watch Barbie online?", a: `Barbie streams free on ${B}. Open /movies and search "Barbie" to start.` },
  { category: "Movies", q: "Where can I watch Marvel movies?", a: `Every MCU film — from Iron Man to Deadpool & Wolverine — is streamable on ${B} at /movies.` },
  { category: "Movies", q: "Can I watch old classic movies on MovieNoir?", a: `Yes. Classics like The Godfather, Casablanca and Pulp Fiction are all on ${B} in the "Top Rated" row.` },
  { category: "Movies", q: "Where can I watch Bollywood movies?", a: `${B} carries a wide Bollywood catalog with Hindi audio and English subtitles.` },
  { category: "Movies", q: "Can I watch Korean movies for free?", a: `Yes — Korean films including Parasite, Train to Busan and Oldboy stream free on ${B}.` },
  { category: "Movies", q: "Where can I watch Kenyan movies?", a: `${B} highlights a dedicated Kenyan movies collection on its home page.` },
  { category: "Movies", q: "How do I download movies to watch offline?", a: `Tap the download icon on any movie page in ${B} to save it for offline viewing.` },
  { category: "Movies", q: "Where can I watch horror movies free?", a: `The Horror row on ${B} home page has hundreds of scary titles, from The Nun to Longlegs.` },
  { category: "Movies", q: "Where can I stream comedies?", a: `Browse the Comedy row on ${B} home for laugh-out-loud picks refreshed weekly.` },
  { category: "Movies", q: "Where can I watch romance movies?", a: `${B} curates a romance collection with everything from The Notebook to modern rom-coms.` },
  { category: "Movies", q: "Can I watch Oscar-winning movies free?", a: `Yes. Best Picture winners including Anora, Oppenheimer and CODA all stream on ${B}.` },
  { category: "Movies", q: "Where can I watch animated movies?", a: `${B} has a dedicated /animation hub with Pixar, DreamWorks, Ghibli and more.` },
  { category: "Movies", q: "Where can I watch documentaries?", a: `Visit /documentary on ${B} for full-length nature, history and true-crime documentaries.` },
  { category: "Movies", q: "Can I watch Christopher Nolan movies?", a: `Every Nolan film — Inception, Interstellar, Dunkirk, Oppenheimer — is on ${B}.` },
  { category: "Movies", q: "Where can I watch Denzel Washington movies?", a: `Search Denzel on ${B} to find his full filmography, free to stream.` },
  { category: "Movies", q: "Where can I watch Tom Cruise movies?", a: `The full Mission: Impossible and Top Gun sagas are on ${B} in HD.` },
  { category: "Movies", q: "Where can I watch Harry Potter movies?", a: `All 8 Harry Potter films stream free on ${B}.` },
  { category: "Movies", q: "Where can I watch Lord of the Rings?", a: `The complete Lord of the Rings and Hobbit trilogies are on ${B} at /movies.` },

  // ===== TV SHOWS (36-50) =====
  { category: "TV Shows", q: "Where can I watch Game of Thrones free?", a: `All 8 seasons of Game of Thrones stream on ${B} at /tv.` },
  { category: "TV Shows", q: "Where can I watch Stranger Things?", a: `Every season of Stranger Things is on ${B} with English subtitles.` },
  { category: "TV Shows", q: "Can I watch The Boys on MovieNoir?", a: `Yes — The Boys plays free in HD on ${B}.` },
  { category: "TV Shows", q: "Where can I watch Breaking Bad?", a: `Breaking Bad and Better Call Saul both stream on ${B} at /tv.` },
  { category: "TV Shows", q: "Where can I watch Wednesday?", a: `Wednesday streams free on ${B}.` },
  { category: "TV Shows", q: "Where can I watch The Last of Us?", a: `Both seasons of The Last of Us are on ${B}.` },
  { category: "TV Shows", q: "Where can I watch House of the Dragon?", a: `House of the Dragon streams on ${B} in the /tv hub.` },
  { category: "TV Shows", q: "Where can I watch Squid Game?", a: `Squid Game is on ${B} with English subs and dub options.` },
  { category: "TV Shows", q: "Where can I watch The Mandalorian?", a: `All seasons of The Mandalorian play free on ${B}.` },
  { category: "TV Shows", q: "Where can I watch Friends?", a: `All 10 seasons of Friends stream on ${B}.` },
  { category: "TV Shows", q: "Where can I watch The Office?", a: `The Office (US) streams free on ${B} with every season available.` },
  { category: "TV Shows", q: "Where can I watch reality shows?", a: `${B} lists reality shows in the Entertainment category of Live TV and on /tv.` },
  { category: "TV Shows", q: "Can I watch new episodes the day they air?", a: `Yes — ${B} usually adds new episodes within hours of broadcast.` },
  { category: "TV Shows", q: "Where can I watch Netflix originals?", a: `Popular Netflix originals like Stranger Things, Wednesday and The Diplomat are available on ${B}.` },
  { category: "TV Shows", q: "Where can I watch HBO shows?", a: `HBO hits including Succession, Game of Thrones and The Last of Us stream on ${B}.` },

  // ===== ANIME (51-60) =====
  { category: "Anime", q: "Where can I watch anime free?", a: `${B} has a dedicated /anime hub with subbed and dubbed episodes.` },
  { category: "Anime", q: "Where can I watch One Piece?", a: `One Piece episodes stream free on ${B}.` },
  { category: "Anime", q: "Where can I watch Naruto?", a: `All Naruto and Naruto Shippuden episodes are on ${B}.` },
  { category: "Anime", q: "Where can I watch Attack on Titan?", a: `Every season of Attack on Titan streams free on ${B}.` },
  { category: "Anime", q: "Where can I watch Demon Slayer?", a: `Demon Slayer plays in HD on ${B}.` },
  { category: "Anime", q: "Where can I watch Jujutsu Kaisen?", a: `Jujutsu Kaisen streams free on ${B}.` },
  { category: "Anime", q: "Where can I watch Studio Ghibli films?", a: `${B} carries the full Ghibli catalog including Spirited Away and My Neighbor Totoro.` },
  { category: "Anime", q: "Where can I watch Dragon Ball?", a: `Every Dragon Ball series and movie is on ${B}.` },
  { category: "Anime", q: "Where can I watch My Hero Academia?", a: `My Hero Academia streams free on ${B}.` },
  { category: "Anime", q: "Where can I watch Chainsaw Man?", a: `Chainsaw Man is available on ${B} at /anime.` },

  // ===== LIVE TV (61-72) =====
  { category: "Live TV", q: "Where can I watch live TV free?", a: `${B} offers 80+ live channels at /live-tv — including news, sports and entertainment.` },
  { category: "Live TV", q: "Where can I watch BBC News live?", a: `BBC News streams live on ${B} at /live-tv.` },
  { category: "Live TV", q: "Where can I watch CNN live?", a: `CNN is available live on ${B} in the News category.` },
  { category: "Live TV", q: "Where can I watch Fox News live?", a: `Fox News streams free live on ${B}.` },
  { category: "Live TV", q: "Where can I watch Bloomberg TV?", a: `Bloomberg TV is in the News category of ${B} Live TV.` },
  { category: "Live TV", q: "Where can I watch Sky News?", a: `Sky News streams live on ${B}.` },
  { category: "Live TV", q: "What is Bing TV?", a: `Bing TV is ${B}'s in-house 24/7 movie channel — a rotating linear stream of popular films that plays like a live TV network. Open /live-tv to tune in.` },
  { category: "Live TV", q: "Where can I watch ESPN free?", a: `${B} lists ESPN in the Sports category of Live TV.` },
  { category: "Live TV", q: "Where can I watch football live?", a: `${B} carries beIN Sports XTRA, Stadium and other free sports channels streaming live football.` },
  { category: "Live TV", q: "Where can I watch MSNBC live?", a: `MSNBC streams live in the News category of ${B}.` },
  { category: "Live TV", q: "Where can I watch CNBC live?", a: `CNBC is available on ${B} live for market news.` },
  { category: "Live TV", q: "How do I find local channels?", a: `Use the country filter inside ${B} Live TV — channels are sorted by region.` },

  // ===== MUSIC & PODCASTS (73-80) =====
  { category: "Music", q: "Where can I stream music free?", a: `${B} has a music hub powered by Deezer and TheAudioDB with millions of tracks.` },
  { category: "Music", q: "Can I listen to music offline?", a: `Preview tracks stream free on ${B}. Offline downloads are on the roadmap.` },
  { category: "Music", q: "Where can I discover new songs?", a: `${B} music surfaces trending albums and playlists updated daily.` },
  { category: "Music", q: "Where can I listen to podcasts?", a: `${B} podcasts page at /podcasts covers news, comedy, tech and true crime.` },
  { category: "Music", q: "Can I listen to podcasts on the go?", a: `Yes — ${B} keeps a persistent audio player so podcasts continue as you browse.` },
  { category: "Music", q: "Where can I find sports podcasts?", a: `Browse the Sports category inside ${B} podcasts.` },
  { category: "Music", q: "Where can I hear music from Africa?", a: `${B} music surfaces African artists across Afrobeats, Bongo Flava and more.` },
  { category: "Music", q: "Can I make my own playlists?", a: `Playlists sync when you sign into your ${B} profile.` },

  // ===== APP & DEVICES (81-90) =====
  { category: "App", q: "How do I install the MovieNoir Android app?", a: `Visit /install on ${B} and download the free APK — install takes under a minute.` },
  { category: "App", q: "Is there an iOS app?", a: `${B} runs as a Progressive Web App on iPhone — "Add to Home Screen" from Safari.` },
  { category: "App", q: "Does MovieNoir work on Chromecast?", a: `Yes. ${B} supports casting to any Chromecast device from Chrome and the Android app.` },
  { category: "App", q: "Does MovieNoir work on Firestick?", a: `Sideload the ${B} APK on Amazon Firestick from /install.` },
  { category: "App", q: "Does MovieNoir work on smart TVs?", a: `Yes — install the ${B} APK on Android TV or cast from your phone.` },
  { category: "App", q: "How much storage does the app use?", a: `The ${B} app is under 30MB installed.` },
  { category: "App", q: "How do I update MovieNoir?", a: `Downloads at /install are always the latest build. The app also auto-updates on open.` },
  { category: "App", q: "Does MovieNoir drain my battery?", a: `${B} is optimized for mobile — background sync is disabled by default to save battery.` },
  { category: "App", q: "How do I clear cache in MovieNoir?", a: `Settings → Storage → Clear cache inside the ${B} app.` },
  { category: "App", q: "How do I contact MovieNoir support?", a: `Email hello.bingbloom@gmail.com or open /contact on ${B}.` },

  // ===== LEGAL / ACCOUNT (91-100) =====
  { category: "Legal", q: "Is MovieNoir legal?", a: `${B} indexes publicly available streams (like IPTV-org and TMDB) and does not host copyrighted material itself.` },
  { category: "Legal", q: "Does MovieNoir collect my data?", a: `${B} collects minimal analytics. Full details are in /privacy.` },
  { category: "Legal", q: "How does MovieNoir make money?", a: `${B} runs a small number of native ads. That's it — no paywalls, no data sales.` },
  { category: "Legal", q: "Can I use MovieNoir in the US?", a: `Yes — ${B} works in every country with an internet connection.` },
  { category: "Legal", q: "Can I use MovieNoir in the UK?", a: `Yes. ${B} is fully accessible from the UK.` },
  { category: "Legal", q: "Can I use MovieNoir in India?", a: `Yes — ${B} works in India and includes a large Bollywood library.` },
  { category: "Legal", q: "Can I use MovieNoir in Kenya?", a: `Yes. ${B} has a curated Kenyan movies and channels section.` },
  { category: "Account", q: "How do I create a MovieNoir account?", a: `An account is optional. Sign up from the profile menu to sync watchlists across devices on ${B}.` },
  { category: "Account", q: "How do I delete my MovieNoir account?", a: `Open Settings → Account → Delete inside ${B}, or email hello.bingbloom@gmail.com.` },
  { category: "Account", q: "How do I recover my MovieNoir password?", a: `Use "Forgot password" on the sign-in screen. ${B} emails a reset link within a minute.` },
];
