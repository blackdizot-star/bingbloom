// Open Library (public, no key) — Novel/Books data source.
// We deliberately don't surface the provider name in the UI.

export interface NovelItem {
  id: string;        // works/OL... key (without leading slash)
  title: string;
  author: string;
  cover: string;     // full URL or empty
  year?: number;
  description?: string;
  subjects?: string[];
}

const COVER = (id: number, size: "S" | "M" | "L" = "L") =>
  id ? `https://covers.openlibrary.org/b/id/${id}-${size}.jpg` : "";

const KEY = (k?: string) => (k || "").replace(/^\/+/, "");

const normalizeWork = (w: any): NovelItem => ({
  id: KEY(w.key),
  title: w.title || "Untitled",
  author: (w.authors && w.authors[0]?.name) || (w.author_name && w.author_name[0]) || "Unknown author",
  cover:
    COVER(w.cover_id || w.cover_i, "L") ||
    (w.cover_edition_key
      ? `https://covers.openlibrary.org/b/olid/${w.cover_edition_key}-L.jpg`
      : ""),
  year: w.first_publish_year || undefined,
  subjects: w.subject || undefined,
});

export async function fetchTrendingNovels(): Promise<NovelItem[]> {
  // Daily trending — broad mix of fiction/novels.
  const res = await fetch("https://openlibrary.org/trending/daily.json?limit=24");
  const json = await res.json();
  return (json.works || []).map(normalizeWork);
}

export async function fetchNovelsBySubject(subject: string, limit = 24): Promise<NovelItem[]> {
  const res = await fetch(
    `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=${limit}`,
  );
  const json = await res.json();
  return (json.works || []).map(normalizeWork);
}

export async function searchNovels(query: string): Promise<NovelItem[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=24`,
  );
  const json = await res.json();
  return (json.docs || []).map(normalizeWork);
}

export async function fetchNovelDetail(id: string): Promise<NovelItem | null> {
  const key = KEY(id);
  const res = await fetch(`https://openlibrary.org/works/${key}.json`);
  if (!res.ok) return null;
  const w = await res.json();
  let description: string | undefined;
  if (typeof w.description === "string") description = w.description;
  else if (w.description?.value) description = w.description.value;

  let author = "Unknown author";
  if (w.authors?.[0]?.author?.key) {
    try {
      const a = await fetch(`https://openlibrary.org${w.authors[0].author.key}.json`).then((r) => r.json());
      author = a.name || author;
    } catch { /* ignore */ }
  }

  return {
    id: key,
    title: w.title || "Untitled",
    author,
    cover: w.covers?.[0] ? COVER(w.covers[0], "L") : "",
    description,
    subjects: w.subjects,
  };
}
