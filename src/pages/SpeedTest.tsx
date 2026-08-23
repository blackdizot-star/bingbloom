import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "Recommended Speeds", table: { headers: ["Quality", "Minimum Speed"], rows: [
    ["Standard Definition (SD)", "3 Mbps"],
    ["High Definition (HD)", "8 Mbps"],
    ["Full HD (1080p)", "15 Mbps"],
  ]}},
  { heading: "How to Improve Streaming Performance", bullets: [
    "Close other tabs and apps that use bandwidth",
    "Use a wired connection instead of Wi-Fi when possible",
    "Restart your router if speeds are slower than expected",
    "Reduce video quality in settings if you experience buffering",
  ]},
  { heading: "Common Issues", groups: [
    { title: "Buffering", paragraphs: ["Usually caused by slow internet speeds or network congestion."] },
    { title: "Low Quality", paragraphs: ["The player automatically adjusts quality based on your connection."] },
    { title: "Connection Drops", paragraphs: ["Try restarting your device or router."] },
  ]},
];
export default function SpeedTest() {
  return <LegalPage title="Speed Test" description="Check your internet connection for the best MovieNoir streaming experience." intro="Check your internet connection speed to ensure the best streaming experience on MovieNoir. We recommend using fast.com or speedtest.net." sections={sections} cta={{ label: "Open fast.com", href: "https://fast.com" }} />;
}
