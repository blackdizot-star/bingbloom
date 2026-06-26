import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, ChevronLeft, Search, Trash2, CloudDownload, X, Pause, Loader2, Folder, ChevronDown } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import { getAllDownloads, deleteDownload, getDownloadBlobUrl, pauseDownload, type OfflineVideo } from "@/lib/offlineDownloads";
import { toast } from "sonner";

function fmtMB(bytes: number) {
  if (!bytes) return "";
  const mb = bytes / 1024 / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(0)} MB`;
}

interface SeriesFolder {
  key: string;
  tmdbId: string;
  title: string;
  poster?: string | null;
  episodes: OfflineVideo[];
}

const MyDownloadsPage = () => {
  const [offline, setOffline] = useState<OfflineVideo[]>([]);
  const [query, setQuery] = useState("");
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [playTitle, setPlayTitle] = useState("");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const playOffline = async (v: OfflineVideo) => {
    const url = await getDownloadBlobUrl(v.id);
    if (!url) { toast.error("This download isn't ready yet."); return; }
    setPlayTitle(v.title);
    setPlayUrl(url);
  };

  const closePlayer = () => {
    if (playUrl) URL.revokeObjectURL(playUrl);
    setPlayUrl(null);
  };

  const refresh = async () => {
    try { setOffline(await getAllDownloads()); } catch { setOffline([]); }
  };

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 3000);
    return () => clearInterval(i);
  }, []);

  const removeOne = async (id: string) => {
    await deleteDownload(id);
    toast.success("Removed");
    refresh();
  };

  const removeFolder = async (folder: SeriesFolder) => {
    await Promise.all(folder.episodes.map((e) => deleteDownload(e.id)));
    toast.success("Series removed");
    refresh();
  };

  // Split offline downloads into single movies and grouped series folders.
  const { movies, folders } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (s: string) => (!q ? true : s.toLowerCase().includes(q));
    const movieList: OfflineVideo[] = [];
    const folderMap = new Map<string, SeriesFolder>();

    for (const v of offline) {
      if (v.type === "tv") {
        const key = `tv-${v.tmdbId}`;
        const name = v.seriesTitle || v.title;
        if (!match(name) && !match(v.title)) continue;
        let f = folderMap.get(key);
        if (!f) {
          f = { key, tmdbId: v.tmdbId, title: name, poster: v.poster, episodes: [] };
          folderMap.set(key, f);
        }
        if (!f.poster && v.poster) f.poster = v.poster;
        f.episodes.push(v);
      } else {
        if (match(v.title)) movieList.push(v);
      }
    }

    const folderList = Array.from(folderMap.values());
    folderList.forEach((f) =>
      f.episodes.sort((a, b) => (a.season ?? 0) - (b.season ?? 0) || (a.episode ?? 0) - (b.episode ?? 0)),
    );
    return { movies: movieList, folders: folderList };
  }, [offline, query]);

  const empty = movies.length === 0 && folders.length === 0;

  const renderRow = (v: OfflineVideo, indent = false) => {
    const pct = v.size > 0 ? Math.min(100, Math.round((v.downloaded / v.size) * 100)) : 0;
    const ready = v.status === "ready";
    const downloading = v.status === "downloading" || v.status === "queued";
    return (
      <li key={v.id} className={`flex items-center gap-3 p-2 rounded-xl ${indent ? "ml-3" : ""}`} style={{ background: "#141414" }}>
        <button
          onClick={() => ready && playOffline(v)}
          className="relative w-[58px] h-[78px] rounded-lg overflow-hidden bg-black flex-shrink-0 group"
        >
          {v.poster && <img src={v.poster} alt={v.title} loading="lazy" className="w-full h-full object-cover" />}
          {ready && (
            <span className="absolute inset-0 grid place-items-center bg-black/30">
              <Play className="w-5 h-5 text-white fill-white" />
            </span>
          )}
          {downloading && (
            <span className="absolute inset-0 grid place-items-center bg-black/50">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </span>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-white truncate">
            {indent && v.episode ? `Episode ${v.episode}` : v.title}
          </h3>
          {ready ? (
            <p className="text-[10px] text-emerald-400 mt-0.5">Available offline · {fmtMB(v.size)}</p>
          ) : v.status === "error" ? (
            <p className="text-[10px] text-[#E50914] mt-0.5">Download failed</p>
          ) : v.status === "paused" ? (
            <p className="text-[10px] text-white/55 mt-0.5">Paused · {pct}%</p>
          ) : (
            <p className="text-[10px] text-white/55 mt-0.5">
              Downloading · {pct}% {v.size ? `of ${fmtMB(v.size)}` : ""}
            </p>
          )}
          {!ready && v.status !== "error" && (
            <div className="mt-1.5 h-1 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-[#E50914] transition-all" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
        {downloading && (
          <button onClick={() => pauseDownload(v.id)} className="p-2 text-white/55 hover:text-white" aria-label="Pause">
            <Pause className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => removeOne(v.id)} className="p-2 text-white/55 hover:text-[#E50914]" aria-label="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </li>
    );
  };

  return (
    <AppLayout hideFooter>
      <SEO title="My Downloads – BingBloom" description="Watch your downloaded movies offline anytime on BingBloom." />
      <div className="px-4 pt-3 pb-8 max-w-2xl mx-auto" style={{ background: "#0A0A0A" }}>
        <header className="flex items-center justify-between mb-4 pt-1">
          <button onClick={() => navigate(-1)} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/5 text-white" aria-label="Back">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-bold text-white tracking-wide">Downloads</h1>
          <button onClick={() => setQuery((q) => (q ? "" : " "))} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/5 text-white" aria-label="Search">
            <Search className="w-4 h-4" />
          </button>
        </header>

        {query !== "" && (
          <input
            autoFocus
            value={query.trim()}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search downloads…"
            className="w-full mb-3 px-3 py-2 rounded-lg bg-[#141414] border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#E50914]/60"
          />
        )}

        {empty ? (
          <div className="text-center py-16 text-white/55">
            <CloudDownload className="w-10 h-10 mx-auto mb-3 text-[#E50914]" />
            <p className="text-sm font-semibold text-white">No downloads yet</p>
            <p className="text-[11px] mt-1">Tap the download button on any movie or episode and it will appear here.</p>
            <Link to="/movies" className="inline-block mt-4 px-4 py-2 rounded-lg text-[12px] font-semibold text-white" style={{ background: "#E50914" }}>
              Browse movies
            </Link>
          </div>
        ) : (
          <>
            {folders.length > 0 && (
              <>
                <p className="text-[10px] uppercase tracking-widest text-white/45 mb-2">Series</p>
                <ul className="space-y-2 mb-4">
                  {folders.map((f) => {
                    const isOpen = openFolders[f.key];
                    const readyCount = f.episodes.filter((e) => e.status === "ready").length;
                    return (
                      <li key={f.key} className="rounded-xl overflow-hidden" style={{ background: "#141414" }}>
                        <div className="flex items-center gap-3 p-2">
                          <button
                            onClick={() => setOpenFolders((s) => ({ ...s, [f.key]: !s[f.key] }))}
                            className="relative w-[58px] h-[78px] rounded-lg overflow-hidden bg-black flex-shrink-0"
                          >
                            {f.poster ? (
                              <img src={f.poster} alt={f.title} loading="lazy" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full grid place-items-center text-white/30"><Folder className="w-5 h-5" /></div>
                            )}
                            <span className="absolute bottom-1 right-1 grid place-items-center w-5 h-5 rounded-full bg-black/70">
                              <Folder className="w-3 h-3 text-white" />
                            </span>
                          </button>
                          <button
                            onClick={() => setOpenFolders((s) => ({ ...s, [f.key]: !s[f.key] }))}
                            className="flex-1 min-w-0 text-left"
                          >
                            <h3 className="text-xs font-bold text-white truncate">{f.title}</h3>
                            <p className="text-[10px] text-white/55 mt-0.5">
                              {f.episodes.length} episode{f.episodes.length !== 1 ? "s" : ""} · {readyCount} ready offline
                            </p>
                          </button>
                          <button onClick={() => removeFolder(f)} className="p-2 text-white/55 hover:text-[#E50914]" aria-label="Delete series">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronDown className={`w-4 h-4 text-white/45 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                        {isOpen && (
                          <ul className="space-y-2 px-2 pb-2">
                            {f.episodes.map((e) => renderRow(e, true))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {movies.length > 0 && (
              <>
                <p className="text-[10px] uppercase tracking-widest text-white/45 mb-2">Movies</p>
                <ul className="space-y-2">
                  {movies.map((v) => renderRow(v))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      {playUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={closePlayer}>
          <div className="flex items-center justify-between px-4 h-12 flex-shrink-0">
            <h2 className="text-xs font-semibold text-white truncate pr-3">{playTitle}</h2>
            <button onClick={closePlayer} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 text-white" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 grid place-items-center px-2 pb-4" onClick={(e) => e.stopPropagation()}>
            <video src={playUrl} controls autoPlay playsInline className="w-full md:max-w-3xl max-h-full rounded-lg bg-black" />
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default MyDownloadsPage;
