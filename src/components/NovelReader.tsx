import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronLeft, ChevronRight, Loader2, X, List, Type } from "lucide-react";
import {
  fetchBookText,
  fetchGutenbergBook,
  searchGutenberg,
  type GutenBook,
  type BookChapter,
} from "@/lib/gutenberg";

interface NovelReaderProps {
  // Either a Gutenberg ID, or a title+author to search.
  gutenbergId?: number;
  title?: string;
  author?: string;
  fallbackCover?: string;
  onClose: () => void;
}

const FONT_SIZES = [14, 16, 18, 20, 22] as const;

const NovelReader = ({ gutenbergId, title, author, fallbackCover, onClose }: NovelReaderProps) => {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [showChapters, setShowChapters] = useState(false);
  const [fontSize, setFontSize] = useState<number>(() => {
    const v = Number(localStorage.getItem("novel_font_size"));
    return FONT_SIZES.includes(v as typeof FONT_SIZES[number]) ? v : 16;
  });

  useEffect(() => {
    localStorage.setItem("novel_font_size", String(fontSize));
  }, [fontSize]);

  // Resolve a Gutenberg book — by ID, or by title/author search.
  const bookQuery = useQuery({
    queryKey: ["gutenberg-resolve", gutenbergId, title, author],
    queryFn: async (): Promise<GutenBook | null> => {
      if (gutenbergId) return await fetchGutenbergBook(gutenbergId);
      const q = [title, author].filter(Boolean).join(" ");
      if (!q.trim()) return null;
      const results = await searchGutenberg(q);
      // Prefer the first English book that has a plain-text format.
      return results.find((b) => b.textUrl && b.languages.includes("en")) || results[0] || null;
    },
    staleTime: 1000 * 60 * 60,
  });

  const book = bookQuery.data;

  const chaptersQuery = useQuery<BookChapter[]>({
    queryKey: ["gutenberg-chapters", book?.id],
    queryFn: () => fetchBookText(book!),
    enabled: !!book && !!book.textUrl,
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    setChapterIndex(0);
  }, [book?.id]);

  const chapters = chaptersQuery.data || [];
  const chapter = chapters[chapterIndex];
  const total = chapters.length;

  const prev = () => setChapterIndex((i) => Math.max(0, i - 1));
  const next = () => setChapterIndex((i) => Math.min(total - 1, i + 1));

  const cover = book?.cover || fallbackCover;

  return (
    <div className="fixed inset-0 z-[80] bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/60 backdrop-blur">
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-secondary text-foreground"
          aria-label="Close reader"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {book?.title || title || "Loading..."}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {book?.author || author || ""}
            {chapter && ` · ${chapter.title}`}
          </p>
        </div>

        {/* Font size cycler */}
        <button
          onClick={() => {
            const idx = FONT_SIZES.indexOf(fontSize as typeof FONT_SIZES[number]);
            const next = FONT_SIZES[(idx + 1) % FONT_SIZES.length];
            setFontSize(next);
          }}
          className="p-1.5 rounded-md hover:bg-secondary text-foreground"
          aria-label="Change font size"
          title={`${fontSize}px`}
        >
          <Type className="w-4 h-4" />
        </button>

        {chapters.length > 0 && (
          <button
            onClick={() => setShowChapters((s) => !s)}
            className="p-1.5 rounded-md hover:bg-secondary text-foreground"
            aria-label="Chapters"
          >
            <List className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Chapter sidebar */}
        {showChapters && (
          <aside className="w-64 border-r border-border/50 bg-card/40 overflow-y-auto py-3">
            {chapters.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  setChapterIndex(i);
                  setShowChapters(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs hover:bg-secondary transition-colors ${
                  i === chapterIndex ? "text-primary font-semibold bg-primary/5" : "text-foreground"
                }`}
              >
                <span className="text-muted-foreground mr-1">{i + 1}.</span>
                {c.title}
              </button>
            ))}
          </aside>
        )}

        {/* Reading area */}
        <main className="flex-1 overflow-y-auto">
          {bookQuery.isLoading || chaptersQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              {cover && (
                <img src={cover} alt="" className="w-24 h-36 object-cover rounded mb-4 opacity-70" />
              )}
              <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading chapters…</p>
            </div>
          ) : !book || !book.textUrl ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center max-w-md mx-auto">
              {cover && <img src={cover} alt="" className="w-28 h-40 object-cover rounded mb-4" />}
              <BookOpen className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-base font-semibold text-foreground mb-1">Reader not available</p>
              <p className="text-sm text-muted-foreground">
                We couldn't find a free, full-text version of this book to read inline.
                Try searching for a public-domain classic — they usually have a readable copy.
              </p>
            </div>
          ) : chaptersQuery.isError ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <p className="text-sm text-destructive">Failed to load this book. Please try again.</p>
            </div>
          ) : chapter ? (
            <article
              className="max-w-2xl mx-auto px-6 sm:px-8 py-8 leading-relaxed text-foreground whitespace-pre-wrap"
              style={{ fontSize }}
            >
              <h1 className="text-2xl font-bold mb-1">{book.title}</h1>
              <p className="text-sm text-muted-foreground mb-6">{book.author}</p>
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border/50">
                {chapter.title}
              </h2>
              <div>{chapter.content}</div>
            </article>
          ) : null}
        </main>
      </div>

      {/* Bottom controls */}
      {chapters.length > 0 && (
        <div className="border-t border-border/50 bg-card/60 backdrop-blur flex items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={prev}
            disabled={chapterIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs text-muted-foreground">
            {chapterIndex + 1} / {total}
          </span>
          <button
            onClick={next}
            disabled={chapterIndex >= total - 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-bb text-primary-foreground text-sm font-medium disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NovelReader;
