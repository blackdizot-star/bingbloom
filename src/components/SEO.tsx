import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE = "https://bingbloom.lovable.app";
const DEFAULT_IMAGE = `${SITE}/pwa-512x512.png`;

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: string;
  canonicalPath?: string;
  jsonLd?: Record<string, any>;
  noindex?: boolean;
}

const SEO = ({ title, description = "", image, type = "website", canonicalPath, jsonLd, noindex }: SEOProps) => {
  const loc = useLocation();
  const path = canonicalPath ?? loc.pathname;
  const url = `${SITE}${path}`;
  const safeTitle = title ?? "";
  const fullTitle = safeTitle.length > 60 ? safeTitle.slice(0, 57) + "..." : safeTitle;
  const desc = description.length > 160 ? description.slice(0, 157) + "..." : description;
  const ogImage = image || DEFAULT_IMAGE;

  const jsonLdScript = jsonLd
    ? JSON.stringify({ "@context": "https://schema.org", ...jsonLd })
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex" />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLdScript && (
        <script type="application/ld+json">{jsonLdScript}</script>
      )}
    </Helmet>
  );
};

export default SEO;
