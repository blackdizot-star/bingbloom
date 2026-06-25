import { useState, useEffect, useCallback } from "react";
import type { NormalizedVideo } from "@/hooks/useKenyaContent";

interface WatchEntry {
  video: NormalizedVideo;
  progress: number; // 0-100
  timestamp: number;
}

const STORAGE_KEY = "continue_watching";
const MAX_ENTRIES = 20;

function getEntries(): WatchEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveEntries(entries: WatchEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function trackWatch(video: NormalizedVideo, progress: number) {
  const entries = getEntries();
  const filtered = entries.filter((e) => e.video.id !== video.id);
  // Don't add if fully watched (>95%)
  if (progress > 95) {
    saveEntries(filtered);
    return;
  }
  filtered.unshift({ video, progress, timestamp: Date.now() });
  saveEntries(filtered);
}

export function useContinueWatching() {
  const [entries, setEntries] = useState<WatchEntry[]>([]);

  const refresh = useCallback(() => {
    setEntries(getEntries());
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("focus", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("focus", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  return entries;
}
