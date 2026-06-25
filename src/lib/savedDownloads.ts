// Saved-downloads store backed by localStorage. Lightweight metadata only —
// large MP4 blobs continue to live in IndexedDB via `offlineDownloads.ts`.

const KEY = "bb_downloads_v1";

export interface SavedDownload {
  id: string;                                  // unique within store
  type: "movie" | "tv" | "anime";
  tmdbId: string;
  title: string;
  poster?: string | null;
  backdrop?: string | null;
  season?: number;
  episode?: number;
  sourceUrl?: string;                          // external downloader URL
  sizeMB?: number;                             // approximate file size
  savedAt: number;
}

export function listSavedDownloads(): SavedDownload[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.sort((a, b) => b.savedAt - a.savedAt) : [];
  } catch {
    return [];
  }
}

export function saveDownload(item: Omit<SavedDownload, "savedAt"> & { savedAt?: number }) {
  const all = listSavedDownloads();
  const next = [{ ...item, savedAt: item.savedAt ?? Date.now() }, ...all.filter((x) => x.id !== item.id)];
  try { localStorage.setItem(KEY, JSON.stringify(next.slice(0, 200))); } catch {}
}

export function removeSavedDownload(id: string) {
  const next = listSavedDownloads().filter((x) => x.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
}
