import { useState, useEffect, useCallback } from "react";
import type { NormalizedVideo } from "@/hooks/useKenyaContent";

const STORAGE_KEY = "my_list";

function getList(): NormalizedVideo[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleMyList(video: NormalizedVideo): boolean {
  const list = getList();
  const exists = list.some((v) => v.id === video.id);
  const updated = exists ? list.filter((v) => v.id !== video.id) : [video, ...list];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("mylist-updated"));
  return !exists; // true = added, false = removed
}

export function isInMyList(videoId: string): boolean {
  return getList().some((v) => v.id === videoId);
}

export function useMyList() {
  const [list, setList] = useState<NormalizedVideo[]>(getList);

  const refresh = useCallback(() => setList(getList()), []);

  useEffect(() => {
    window.addEventListener("mylist-updated", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("mylist-updated", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return list;
}
