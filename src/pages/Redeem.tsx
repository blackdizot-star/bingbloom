import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "What is a BingBloom Gift Card?", paragraphs: ["BingBloom gift cards are a great way to support the platform and unlock exclusive perks. They can be redeemed in your Account settings."] },
  { heading: "How It Works", bullets: [
    "Purchase a BingBloom gift card from our website or authorized retailers",
    "Scratch or reveal the code on the back of the card",
    "Enter the code in your Account → Redeem",
    "Click Redeem — your balance is added immediately",
  ]},
  { heading: "Need Help?", paragraphs: ["If you're having trouble with your gift card, please contact support@bingbloom.com."] },
];
export default function Redeem() {
  return <LegalPage title="Redeem Gift Cards" description="Redeem your BingBloom gift card or promo code." intro="Enter your gift card or promo code in your account to add credit to your BingBloom balance." sections={sections} cta={{ label: "Open Account", href: "/profile" }} />;
}
