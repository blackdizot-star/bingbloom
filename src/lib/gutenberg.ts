// Gutendex (https://gutendex.com) — free public Project Gutenberg API.
// Provides full-text URLs for public-domain books. We use it to power the
// readable novel reader, and Open Library for richer modern catalog browsing.

export interface GutenBook {
  id: number;
  title: string;
  author: string;
  cover: string; // Gutenberg cover URL
  textUrl: string | null; // best plain-text URL
  htmlUrl: string | null;
  subjects: string[];
  languages: string[];
}

const pickFormat = (formats: Record<string, string>, regex: RegExp): string | null => {
  const key = Object.keys(formats).find((k) => regex.test(k));
  return key ? formats[key] : null;
};

const normalize = (raw: any): GutenBook => {
  const formats: Record<string, string> = raw.formats || {};
  return {
    id: raw.id,
    title: raw.title || "Untitled",
    author: raw.authors?.[0]?.name || "Unknown author",
    cover: formats["image/jpeg"] || `https://www.gutenberg.org/cache/epub/${raw.id}/pg${raw.id}.cover.medium.jpg`,
    // Prefer UTF-8 plain text without trailing ".zip"
    textUrl:
      pickFormat(formats, /text\/plain;.*utf-8.*/i) ||
      pickFormat(formats, /text\/plain.*utf-8/i) ||
      pickFormat(formats, /text\/plain(?!.*zip)/i),
    htmlUrl: pickFormat(formats, /text\/html(?!.*zip)/i),
    subjects: raw.subjects || [],
    languages: raw.languages || [],
  };
};

export async function fetchTrendingGutenberg(): Promise<GutenBook[]> {
  const res = await fetch("https://gutendex.com/books?sort=popular&languages=en");
  const json = await res.json();
  return (json.results || []).map(normalize);
}

export async function fetchGutenbergByTopic(topic: string): Promise<GutenBook[]> {
  const res = await fetch(
    `https://gutendex.com/books?topic=${encodeURIComponent(topic)}&languages=en&sort=popular`,
  );
  const json = await res.json();
  return (json.results || []).map(normalize);
}

export async function searchGutenberg(query: string): Promise<GutenBook[]> {
  const res = await fetch(
    `https://gutendex.com/books?search=${encodeURIComponent(query)}&languages=en`,
  );
  const json = await res.json();
  return (json.results || []).map(normalize);
}

export async function fetchGutenbergBook(id: number): Promise<GutenBook | null> {
  const res = await fetch(`https://gutendex.com/books/${id}`);
  if (!res.ok) return null;
  return normalize(await res.json());
}

export interface BookChapter {
  title: string;
  content: string;
}

// Strip Gutenberg headers/footers, then split on chapter/part markers.
export function splitChapters(raw: string): BookChapter[] {
  let text = raw.replace(/\r\n/g, "\n");

  // Strip the *** START OF THIS PROJECT GUTENBERG EBOOK ... *** preamble.
  const startMatch = text.match(/\*\*\*\s*START OF (?:THIS|THE) PROJECT GUTENBERG[^\*]*\*\*\*/i);
  if (startMatch && startMatch.index !== undefined) {
    text = text.slice(startMatch.index + startMatch[0].length);
  }
  const endMatch = text.match(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG[^\*]*\*\*\*/i);
  if (endMatch && endMatch.index !== undefined) {
    text = text.slice(0, endMatch.index);
  }
  text = text.trim();

  // Split on chapter/part headings appearing on their own line.
  const splitRegex = /\n(?=(?:CHAPTER|Chapter|PART|Part|BOOK|Book|LETTER|Letter)[ \t]+[IVXLCDM\d]+[\.:]?\s*[^\n]{0,80}\n)/g;
  const segments = text.split(splitRegex);

  if (segments.length <= 1) {
    // No chapter markers — chunk into ~3,500-character pages so it's still navigable.
    const CHUNK = 3500;
    const out: BookChapter[] = [];
    for (let i = 0; i < text.length; i += CHUNK) {
      const slice = text.slice(i, i + CHUNK).trim();
      if (slice) out.push({ title: `Page ${out.length + 1}`, content: slice });
    }
    return out.length ? out : [{ title: "Full Text", content: text }];
  }

  return segments
    .map((seg, i) => {
      const trimmed = seg.trim();
      if (!trimmed) return null;
      // First line is the chapter heading.
      const firstNewline = trimmed.indexOf("\n");
      let title = `Chapter ${i}`;
      let content = trimmed;
      if (firstNewline > 0 && firstNewline < 120) {
        title = trimmed.slice(0, firstNewline).trim() || title;
        content = trimmed.slice(firstNewline + 1).trim();
      } else if (i === 0) {
        title = "Front Matter";
      }
      return { title, content };
    })
    .filter((c): c is BookChapter => !!c && c.content.length > 50);
}

export async function fetchBookText(book: GutenBook): Promise<BookChapter[]> {
  if (!book.textUrl) throw new Error("No readable text format available for this book.");
  // Some Gutenberg URLs are http and may CORS-block; rewrite to https.
  const url = book.textUrl.replace(/^http:/, "https:");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load book (${res.status})`);
  const text = await res.text();
  return splitChapters(text);
}
