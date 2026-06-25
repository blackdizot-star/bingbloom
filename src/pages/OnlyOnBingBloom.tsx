import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "Curated Collections", paragraphs: ["Our team handpicks content to bring you the best movies, shows, and music across all genres. Discover hidden gems and timeless classics."] },
  { heading: "BingBloom Originals", paragraphs: ["We're building a library of original content you won't find anywhere else. Stay tuned for our first original productions coming soon."] },
  { heading: "Ad-Supported, Always Free", paragraphs: ["We believe entertainment should be accessible to everyone. BingBloom will always be free with ad support — no subscriptions, no hidden fees."] },
  { heading: "Cross-Platform Experience", paragraphs: ["Start watching on your phone, continue on your tablet, and finish on your TV — all with your watchlist synced across devices."] },
  { heading: "Offline Downloads", paragraphs: ["Take your favorite content with you. Download movies and episodes to watch offline, anywhere, anytime."] },
  { heading: "Community-Driven", paragraphs: ["We listen to our users. Suggest features, vote on content, and help shape the future of BingBloom."] },
  { heading: "Smart Recommendations", paragraphs: ["Our recommendation engine learns what you like and suggests content tailored to your tastes."] },
];
export default function OnlyOnBingBloom() {
  return <LegalPage title="Only on BingBloom" description="Exclusive content, originals and features unique to BingBloom." intro="BingBloom is more than just a streaming platform — we're a destination for unique entertainment experiences." sections={sections} />;
}
