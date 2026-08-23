import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "On Your Computer", paragraphs: ["Visit bingbloom.com using any modern web browser — Chrome, Edge, Firefox, Safari, or Opera. No downloads required."] },
  { heading: "On Your Phone or Tablet", groups: [
    { title: "Android (5.0+)", bullets: ["Visit bingbloom.com in Chrome", "Tap the Install App prompt that appears", "The PWA installs to your home screen"] },
    { title: "iOS (Safari)", bullets: ["Visit bingbloom.com in Safari", "Tap the Share button", "Scroll down and tap Add to Home Screen", "Name it MovieNoir and tap Add"] },
  ]},
  { heading: "On Your TV", paragraphs: ["Use your Smart TV's built-in browser at bingbloom.com, cast from Chrome/Android, AirPlay from Safari/iOS, or use the browser on PlayStation/Xbox."] },
  { heading: "Offline Viewing", paragraphs: ["With our download feature (mobile PWA) you can save movies and episodes to watch offline — perfect for airplane mode, commutes, or areas with poor connectivity."] },
  { heading: "Progressive Web App (PWA)", bullets: ["App-like experience with full-screen viewing", "Faster loading and smoother playback", "Offline support for downloaded content", "Home-screen icon for quick access"] },
];
export default function WaysToWatch() {
  return <LegalPage title="Ways to Watch" description="Watch MovieNoir on web, mobile, tablet, TV and offline." intro="MovieNoir is designed to be accessible wherever you are, on whatever device you prefer. Here's how to start watching." sections={sections} cta={{ label: "Install MovieNoir", href: "/install" }} />;
}
