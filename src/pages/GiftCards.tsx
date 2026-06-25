import LegalPage from "@/components/LegalPage";
const sections = [
  { heading: "Gift Card Details", bullets: [
    "Digital Delivery: cards are delivered via email within minutes",
    "No Expiration: your balance never expires",
    "Easy Redemption: redeem in Account → Redeem",
  ]},
  { heading: "How It Works", bullets: [
    "Select your gift card amount",
    "Enter the recipient's email (or your own)",
    "Complete payment",
    "Gift card is sent immediately",
  ]},
  { heading: "Terms & Conditions", bullets: [
    "Gift cards are non-refundable",
    "Gift cards have no cash value",
    "Gift cards can be applied to any BingBloom account",
  ]},
];
export default function GiftCards() {
  return <LegalPage title="Buy Gift Cards" description="Give the gift of entertainment with BingBloom gift cards." intro="Choose your amount — $5, $10, $25, $50 or a custom amount — and send the gift of BingBloom instantly." sections={sections} cta={{ label: "Contact sales", href: "/contact" }} />;
}
