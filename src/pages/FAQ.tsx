import LegalPage from "@/components/LegalPage";

const sections = [
  { heading: "Getting Started", groups: [
    { title: "What is MovieNoir?", paragraphs: ["MovieNoir is a free, ad-supported streaming platform that gives you access to thousands of movies, TV shows, live channels, music, and podcasts. No subscriptions, no credit card required — just pure entertainment."] },
    { title: "Do I need to create an account to watch?", paragraphs: ["No. You can start watching immediately without signing up. However, creating a free account lets you save your watchlist, continue watching across devices, and receive personalized recommendations."] },
    { title: "How much does MovieNoir cost?", paragraphs: ["MovieNoir is completely free. We are an ad-supported platform, which means you'll see occasional banner ads while browsing. We never charge for access to our content."] },
  ]},
  { heading: "Watching on MovieNoir", groups: [
    { title: "What devices can I watch on?", paragraphs: ["MovieNoir works on any device with a modern web browser — desktop computers, laptops, smartphones, and tablets. You can also install MovieNoir as a Progressive Web App (PWA) for an app-like experience."] },
    { title: "Do I need to download anything?", paragraphs: ["No downloads are required to start watching. Simply visit our website and start streaming. For the best experience, we recommend installing the MovieNoir PWA on your device."] },
    { title: "What internet speed do I need?", paragraphs: ["We recommend a minimum of 5 Mbps for standard definition and 15 Mbps for high definition streaming."] },
    { title: "Can I watch offline?", paragraphs: ["Yes. You can download movies and episodes to watch offline when you're on the go. Downloads are available through our mobile app."] },
  ]},
  { heading: "Account & Settings", groups: [
    { title: "How do I create an account?", paragraphs: ["Tap Sign In, enter your phone number, and verify the one-time code we text you. That's it — you're in."] },
    { title: "I lost access to my phone number.", paragraphs: ["Contact support@bingbloom.com from the email you originally used and we'll help recover access."] },
    { title: "How do I update my account information?", paragraphs: ["Go to your Profile page, then Settings, to update notification preferences and your display name."] },
  ]},
  { heading: "Troubleshooting", groups: [
    { title: "The video won't play.", paragraphs: ["Try the Next Server button on the player. You can also try refreshing the page, clearing your browser cache, or using a different browser."] },
    { title: "Video is buffering.", paragraphs: ["Lower the quality, close other tabs that use bandwidth, or switch from Wi-Fi to a wired connection if possible."] },
    { title: "\"No stream available\".", paragraphs: ["The source is temporarily down. Tap a different server (HD or PixaPlay) or try again in a few minutes."] },
  ]},
  { heading: "Content & Features", groups: [
    { title: "What content does MovieNoir offer?", paragraphs: ["Movies, TV series, live TV, anime, music videos and podcasts — from Hollywood blockbusters to indie films and the latest episodes."] },
    { title: "How often is new content added?", paragraphs: ["New content is added daily. Check the New Releases row regularly to stay updated."] },
    { title: "Can I request a movie or TV show?", paragraphs: ["Absolutely. Email hello.bingbloom@gmail.com and we review every suggestion."] },
  ]},
  { heading: "Billing & Payments", groups: [
    { title: "Is MovieNoir really free?", paragraphs: ["Yes — 100% free. Revenue comes from non-intrusive banner advertisements."] },
    { title: "Do you accept gift cards?", paragraphs: ["Yes. Purchase them through our website and redeem them in your Account settings."] },
  ]},
  { heading: "Privacy & Legal", groups: [
    { title: "How does MovieNoir use my data?", paragraphs: ["See our Privacy Policy for detailed information on how we collect, use and protect your personal information."] },
    { title: "How do I delete my account?", paragraphs: ["Email support@bingbloom.com and our team will process the deletion."] },
  ]},
];

export default function FAQ() {
  return <LegalPage title="Frequently Asked Questions" description="Answers to common MovieNoir questions: watching, accounts, troubleshooting, billing and privacy." sections={sections} />;
}
