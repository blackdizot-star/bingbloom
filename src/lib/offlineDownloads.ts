// IndexedDB-backed offline video store.
// Stores MP4 blobs in chunks for resumable download + offline playback.

const DB_NAME = "bingbloom-offline";
const DB_VERSION = 1;
const STORE_META = "videos";     // metadata + completed blob
const STORE_CHUNKS = "chunks";   // per-video temp chunks during download

export interface OfflineVideo {
  id: string;                  // `${type}-${tmdbId}` (or per-episode for tv)
  type: "movie" | "tv" | "anime";
  tmdbId: string;
  title: string;               // per-episode title shown in UI
  seriesTitle?: string;        // folder name for grouped series episodes
  season?: number;
  episode?: number;
  poster?: string | null;
  backdrop?: string | null;
  sourceUrl: string;
  mime: string;
  size: number;                // total bytes
  downloaded: number;          // bytes downloaded so far
  status: "queued" | "downloading" | "paused" | "ready" | "error";
  error?: string;
  blob?: Blob;                 // present once status==="ready"
  createdAt: number;
  updatedAt: number;
}

const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MiB

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
        db.createObjectStore(STORE_CHUNKS, { keyPath: ["videoId", "index"] });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(storeName, mode);
        const r = run(t.objectStore(storeName));
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      }),
  );
}

export async function getAllDownloads(): Promise<OfflineVideo[]> {
  const list = await tx<OfflineVideo[]>(STORE_META, "readonly", (s) =>
    s.getAll() as IDBRequest<OfflineVideo[]>,
  );
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getDownload(id: string): Promise<OfflineVideo | undefined> {
  return tx<OfflineVideo | undefined>(STORE_META, "readonly", (s) =>
    s.get(id) as IDBRequest<OfflineVideo | undefined>,
  );
}

export async function isDownloaded(id: string): Promise<boolean> {
  const v = await getDownload(id);
  return !!v && v.status === "ready" && !!v.blob;
}

export async function getDownloadBlobUrl(id: string): Promise<string | null> {
  const v = await getDownload(id);
  if (!v || v.status !== "ready" || !v.blob) return null;
  return URL.createObjectURL(v.blob);
}

async function putMeta(meta: OfflineVideo): Promise<void> {
  await tx(STORE_META, "readwrite", (s) => s.put(meta));
}

export async function deleteDownload(id: string): Promise<void> {
  await tx(STORE_META, "readwrite", (s) => s.delete(id));
  // remove chunks
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction(STORE_CHUNKS, "readwrite");
    const store = t.objectStore(STORE_CHUNKS);
    const req = store.openCursor();
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) {
        const k = cur.key as [string, number];
        if (k[0] === id) cur.delete();
        cur.continue();
      }
    };
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

export async function estimateStorage(): Promise<{
  quota: number;
  usage: number;
  free: number;
  pctUsed: number;
}> {
  if (!("storage" in navigator) || !navigator.storage.estimate) {
    return { quota: 0, usage: 0, free: 0, pctUsed: 0 };
  }
  const est = await navigator.storage.estimate();
  const quota = est.quota || 0;
  const usage = est.usage || 0;
  return {
    quota,
    usage,
    free: Math.max(0, quota - usage),
    pctUsed: quota > 0 ? (usage / quota) * 100 : 0,
  };
}

type ProgressFn = (meta: OfflineVideo) => void;

const activeControllers = new Map<string, AbortController>();
const pauseFlags = new Map<string, boolean>();

export function pauseDownload(id: string) {
  pauseFlags.set(id, true);
  activeControllers.get(id)?.abort();
}

export function isPaused(id: string) {
  return pauseFlags.get(id) === true;
}

/** Resume a paused download. Re-invokes startDownload with the stored args. */
export async function resumeDownload(id: string): Promise<OfflineVideo | null> {
  const meta = await getDownload(id);
  if (!meta) return null;
  if (meta.status === "ready") return meta;
  return startDownload({
    id: meta.id,
    type: meta.type,
    tmdbId: meta.tmdbId,
    title: meta.title,
    seriesTitle: meta.seriesTitle,
    season: meta.season,
    episode: meta.episode,
    poster: meta.poster,
    backdrop: meta.backdrop,
    sourceUrl: meta.sourceUrl,
    mime: meta.mime,
  });
}

interface StartArgs {
  id: string;
  type: OfflineVideo["type"];
  tmdbId: string;
  title: string;
  seriesTitle?: string;
  season?: number;
  episode?: number;
  poster?: string | null;
  backdrop?: string | null;
  sourceUrl: string;
  mime?: string;
  onProgress?: ProgressFn;
}

/**
 * Start (or resume) a download. Streams the MP4 in CHUNK_SIZE byte ranges
 * so it can be paused/resumed and progress reported.
 */
export async function startDownload(args: StartArgs): Promise<OfflineVideo> {
  const { id, sourceUrl, onProgress } = args;
  pauseFlags.set(id, false);

  // Load or init meta
  let meta = await getDownload(id);
  if (!meta) {
    meta = {
      id,
      type: args.type,
      tmdbId: args.tmdbId,
      title: args.title,
      seriesTitle: args.seriesTitle,
      season: args.season,
      episode: args.episode,
      poster: args.poster ?? null,
      backdrop: args.backdrop ?? null,
      sourceUrl,
      mime: args.mime || "video/mp4",
      size: 0,
      downloaded: 0,
      status: "queued",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await putMeta(meta);
  } else if (meta.status === "ready") {
    return meta;
  }

  // Storage guard
  const { free } = await estimateStorage();

  // Probe total size with HEAD or Range 0-0
  try {
    const probe = await fetch(sourceUrl, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
    });
    const contentRange = probe.headers.get("Content-Range");
    if (contentRange) {
      const total = Number(contentRange.split("/")[1] || 0);
      meta.size = total || meta.size;
    } else {
      const cl = Number(probe.headers.get("Content-Length") || 0);
      meta.size = cl || meta.size;
    }
    const ct = probe.headers.get("Content-Type");
    if (ct) meta.mime = ct;
  } catch {
    // ignore – we'll still try a full GET below
  }

  if (free > 0 && meta.size > 0 && meta.size > free) {
    meta.status = "error";
    meta.error = "Not enough storage available";
    meta.updatedAt = Date.now();
    await putMeta(meta);
    onProgress?.(meta);
    return meta;
  }

  meta.status = "downloading";
  meta.updatedAt = Date.now();
  await putMeta(meta);
  onProgress?.(meta);

  // Determine where to resume
  let nextIndex = Math.floor(meta.downloaded / CHUNK_SIZE);

  const ctrl = new AbortController();
  activeControllers.set(id, ctrl);

  try {
    while (true) {
      if (pauseFlags.get(id)) break;
      const start = nextIndex * CHUNK_SIZE;
      if (meta.size > 0 && start >= meta.size) break;
      const end = meta.size > 0 ? Math.min(start + CHUNK_SIZE - 1, meta.size - 1) : start + CHUNK_SIZE - 1;
      const res = await fetch(sourceUrl, {
        headers: { Range: `bytes=${start}-${end}` },
        signal: ctrl.signal,
      });
      if (!res.ok && res.status !== 206 && res.status !== 200) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buf = await res.arrayBuffer();
      const got = buf.byteLength;
      if (got === 0) break;

      // store chunk
      await tx(STORE_CHUNKS, "readwrite", (s) =>
        s.put({ videoId: id, index: nextIndex, blob: new Blob([buf], { type: meta!.mime }) }),
      );

      meta.downloaded = start + got;
      meta.updatedAt = Date.now();
      if (meta.size === 0 && got < CHUNK_SIZE) {
        meta.size = meta.downloaded;
      }
      await putMeta(meta);
      onProgress?.(meta);

      nextIndex++;
      if (meta.size > 0 && meta.downloaded >= meta.size) break;
      if (got < CHUNK_SIZE) break;
    }

    if (pauseFlags.get(id)) {
      meta.status = "paused";
      meta.updatedAt = Date.now();
      await putMeta(meta);
      onProgress?.(meta);
      return meta;
    }

    // Concatenate chunks into final blob
    const allChunks: { index: number; blob: Blob }[] = await new Promise(
      (resolve, reject) => {
        openDb().then((db) => {
          const t = db.transaction(STORE_CHUNKS, "readonly");
          const store = t.objectStore(STORE_CHUNKS);
          const out: { index: number; blob: Blob }[] = [];
          const req = store.openCursor();
          req.onsuccess = () => {
            const cur = req.result;
            if (cur) {
              const k = cur.key as [string, number];
              if (k[0] === id) {
                const val = cur.value as { index: number; blob: Blob };
                out.push({ index: val.index, blob: val.blob });
              }
              cur.continue();
            } else {
              resolve(out.sort((a, b) => a.index - b.index));
            }
          };
          req.onerror = () => reject(req.error);
        });
      },
    );
    const finalBlob = new Blob(
      allChunks.map((c) => c.blob),
      { type: meta.mime },
    );
    meta.blob = finalBlob;
    meta.size = finalBlob.size;
    meta.downloaded = finalBlob.size;
    meta.status = "ready";
    meta.updatedAt = Date.now();
    await putMeta(meta);

    // Cleanup chunks
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const t = db.transaction(STORE_CHUNKS, "readwrite");
      const store = t.objectStore(STORE_CHUNKS);
      const req = store.openCursor();
      req.onsuccess = () => {
        const cur = req.result;
        if (cur) {
          const k = cur.key as [string, number];
          if (k[0] === id) cur.delete();
          cur.continue();
        }
      };
      t.oncomplete = () => resolve();
    });

    onProgress?.(meta);
    return meta;
  } catch (e: unknown) {
    if ((e as Error).name === "AbortError" || pauseFlags.get(id)) {
      meta.status = "paused";
    } else {
      meta.status = "error";
      meta.error = (e as Error).message || "Download failed";
    }
    meta.updatedAt = Date.now();
    await putMeta(meta);
    onProgress?.(meta);
    return meta;
  } finally {
    activeControllers.delete(id);
  }
}
