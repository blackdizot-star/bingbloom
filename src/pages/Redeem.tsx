import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "What is a MovieNoir Gift Card?", paragraphs: ["MovieNoir gift cards are a great way to support the platform and unlock exclusive perks. They can be redeemed in your Account settings."] },
  { heading: "How It Works", bullets: [
    "Purchase a MovieNoir gift card from our website or authorized retailers",
    "Scratch or reveal the code on the back of the card",
    "Enter the code in your Account → Redeem",
    "Click Redeem — your balance is added immediately",
  ]},
  { heading: "Need Help?", paragraphs: ["If you're having trouble with your gift card, please contact support@bingbloom.com."] },
];
export default function Redeem() {
  return <LegalPage title="Redeem Gift Cards" description="Redeem your MovieNoir gift card or promo code." intro="Enter your gift card or promo code in your account to add credit to your MovieNoir balance." sections={sections} cta={{ label: "Open Account", href: "/profile" }} />;
}
