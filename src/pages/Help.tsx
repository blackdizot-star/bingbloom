import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "Popular Topics", groups: [
    { title: "Account & Settings", bullets: ["Creating an account", "Resetting your phone number", "Updating profile information", "Account security"] },
    { title: "Watching", bullets: ["How to watch on different devices", "Video quality and source selection", "Subtitle and audio options", "Downloading for offline viewing"] },
    { title: "Troubleshooting", bullets: ["Video not playing", "Buffering or lag issues", "Audio problems", "Error messages explained"] },
    { title: "Billing & Payments", bullets: ["Gift cards and promo codes", "Redeeming offers"] },
  ]},
  { heading: "Quick Links", bullets: ["FAQ — Frequently Asked Questions", "Contact Us — Get in touch with support", "Report an Issue — Report a technical problem"] },
  { heading: "Still Need Help?", paragraphs: ["If you can't find what you're looking for, our support team is here to help. Contact us through the Contact page. We aim to respond to all inquiries within 24-48 hours."] },
];
export default function Help() {
  return <LegalPage title="Help Center" description="Find answers, troubleshoot issues, and get the most out of MovieNoir." intro="Welcome to the MovieNoir Help Center. Browse the most common topics or contact our team." sections={sections} cta={{ label: "Contact Us", href: "/contact" }} />;
}
