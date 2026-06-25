// Shorten YouTube titles to clean, concise display titles
const NOISE_PATTERNS = [
  /\s*\|.*$/i,
  /\s*-\s*(official\s*)?(music\s*)?(video|audio|lyrics?|visualizer|trailer|teaser|clip).*$/i,
  /\s*\(?(official\s*)?(music\s*)?(video|audio|lyrics?|visualizer|hd|4k|uhd|1080p|720p)\)?/gi,
  /\s*\[?(official\s*)?(music\s*)?(video|audio|lyrics?|visualizer|hd|4k|uhd|1080p|720p)\]?/gi,
  /\s*\(?(full\s*movie|full\s*film|full\s*hd|eng(lish)?\s*sub(s|titles?)?)\)?/gi,
  /\s*\[?(full\s*movie|full\s*film|full\s*hd|eng(lish)?\s*sub(s|titles?)?)\]?/gi,
  /\s*\(?\d{4}\)?$/,
  /\s*#\w+/g,
  /\s*ft\.?\s*.*/i,
  /\s*feat\.?\s*.*/i,
  /\s*\|\s*$/,
  /\s*-\s*$/,
];

export function shortenTitle(title: string, maxLen = 40): string {
  if (!title) return "Untitled";
  let clean = title;
  for (const p of NOISE_PATTERNS) {
    clean = clean.replace(p, "");
  }
  clean = clean.replace(/\s{2,}/g, " ").trim();
  if (!clean) return title.substring(0, maxLen);
  if (clean.length > maxLen) {
    const cut = clean.substring(0, maxLen);
    const lastSpace = cut.lastIndexOf(" ");
    return lastSpace > maxLen * 0.6 ? cut.substring(0, lastSpace) + "…" : cut + "…";
  }
  return clean;
}
