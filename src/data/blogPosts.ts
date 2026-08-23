export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  date: string;
  author: string;
  body: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "best-free-streaming-apps-2026",
    title: "The Best Free Streaming Apps of 2026",
    excerpt: "From MovieNoir to the rest of the pack — here's how the free streaming landscape looks heading into 2026.",
    cover: "https://image.tmdb.org/t/p/w1280/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    date: "2026-06-01",
    author: "MovieNoir Editors",
    body: [
      "Free streaming has come a long way. In 2026, there's no longer a need to juggle five paid subscriptions to watch the films and series you love. Ad-supported services have matured, catalogs have grown, and the quality is better than ever.",
      "MovieNoir leads the pack with thousands of movies, TV shows, anime, live channels and music — all free, no sign-up required. Downloads work offline, the player supports HD, and the platform never charges for access.",
      "Other free options worth a look include Tubi, Pluto TV and Crackle. Each has its niche; together they cover most mainstream demand. But none combine movies, TV, anime, live TV, music and podcasts the way MovieNoir does.",
      "If you've been paying for content you only half-watch, 2026 is the year to rethink your stack. Start with MovieNoir and see how far free actually goes.",
    ],
  },
  {
    slug: "how-to-download-movies-for-offline-viewing",
    title: "How to Download Movies for Offline Viewing on MovieNoir",
    excerpt: "Step-by-step guide to saving movies and shows for the plane, the commute, or anywhere offline.",
    cover: "https://image.tmdb.org/t/p/w1280/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    date: "2026-05-20",
    author: "MovieNoir Editors",
    body: [
      "Offline downloads are one of MovieNoir's best-kept features. Whether you're heading on a long flight, hopping on the subway or staying somewhere with shaky Wi-Fi, you can grab full movies and TV episodes in advance.",
      "To start, open any movie or episode page and tap the Download button. The download begins immediately and you can keep browsing — the progress bar lives at the top of the Downloads page (open it from the menu).",
      "You can pause and resume downloads at any time. If you lose connection, MovieNoir picks up where it left off when you're back online. Subtitles are downloaded alongside the video when available.",
      "Once a title is fully downloaded, it lives in your library forever, or until you delete it. Tap to play offline — no buffering, no streaming, no data used.",
    ],
  },
  {
    slug: "anime-streaming-guide-2026",
    title: "The Ultimate Anime Streaming Guide for 2026",
    excerpt: "From classics to the newest seasonal hits — your roadmap to anime on MovieNoir.",
    cover: "https://image.tmdb.org/t/p/w1280/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    date: "2026-05-08",
    author: "MovieNoir Editors",
    body: [
      "Anime fans, 2026 is delivering. With major returning seasons from Demon Slayer, Jujutsu Kaisen, My Hero Academia and Chainsaw Man, plus new IP launches from major studios, there's never been more to watch.",
      "MovieNoir's Anime tab now organizes titles across 25 categories — from Shonen to Slice of Life, Mecha to Isekai. Filter, sort, and dive straight into the next great series.",
      "Looking for a starter pack? Try Fullmetal Alchemist: Brotherhood, Steins;Gate or Death Note for legendary classics. For the seasonal newcomer, Frieren: Beyond Journey's End is a must.",
      "All anime on MovieNoir streams free, supports offline downloads, and works on phones, tablets and desktop. Get watching.",
    ],
  },
  {
    slug: "live-tv-without-cable",
    title: "Watch Live TV Without Cable in 2026",
    excerpt: "How to ditch your cable bill and still watch live news, sports highlights and entertainment.",
    cover: "https://image.tmdb.org/t/p/w1280/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg",
    date: "2026-04-22",
    author: "MovieNoir Editors",
    body: [
      "Cable bills keep climbing while cord-cutting keeps growing. In 2026, you don't need a satellite dish or a cable box — just a phone, a tablet or a laptop and MovieNoir.",
      "The Live TV tab on MovieNoir carries 24/7 channels covering news (CNN, BBC, Al Jazeera, France 24), sports highlights, entertainment, kids' programming and music. New channels are added regularly.",
      "Channels are organized so you can find what you want fast. Tap into a channel and it starts playing immediately — no login, no setup, no monthly fee.",
      "If a particular channel matters to you and isn't there yet, let us know. We're constantly expanding the lineup.",
    ],
  },
  {
    slug: "what-to-watch-this-weekend",
    title: "What to Watch This Weekend",
    excerpt: "Our editors' weekly picks across movies, TV, anime and live channels.",
    cover: "https://image.tmdb.org/t/p/w1280/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    date: "2026-06-25",
    author: "MovieNoir Editors",
    body: [
      "Weekends are made for binging. Here's what our team is queuing up this week, all streaming free on MovieNoir.",
      "Movie of the week: a mid-budget thriller that's been quietly climbing our trending charts. Tight pacing, a smart cast, and a third-act twist that's already lighting up Reddit.",
      "TV pick: the latest season of a returning crime drama. If you've fallen off the show, the recap row on the detail page will get you caught up in five minutes.",
      "Bonus: drop a live news channel in the background while you do chores. Tap into the Live TV tab and you're set in two taps.",
    ],
  },
];

export const getBlogPost = (slug: string) => blogPosts.find((p) => p.slug === slug);
