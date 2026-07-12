// moviebox-api: Deno port of https://github.com/walterwhite-69/Moviebox-API
//
// Given a TMDB title + year (+ season/episode for TV), returns a ready-to-play
// stream URL (HLS or MP4) resolved via MovieBox (moviebox.ph / aoneroom / netfilm.world).
//
// POST body: { title: string, year?: string, mediaType: "movie"|"tv", season?: number, episode?: number }
// Response:  { ok: true, kind: "hls"|"mp4", url: string, poster?: string, captions?: [{lang,url}] }
//         or { ok: false, reason: string }
//
// The final `url` is already wrapped through the `proxy` edge function so the
// browser can fetch it (proxy injects the Referer the CDN requires).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const API_BASE = "https://h5-api.aoneroom.com/wefeed-h5api-bff";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent": UA,
  Referer: "https://moviebox.ph/",
  Origin: "https://moviebox.ph",
  "X-Client-Info": '{"timezone":"Africa/Nairobi"}',
  "X-Request-Lang": "en",
  Accept: "application/json",
  "Content-Type": "application/json",
};

const PLAYER_HEADERS: Record<string, string> = {
  "User-Agent": UA,
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  "X-Client-Info": '{"timezone":"Africa/Nairobi"}',
};

let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const r = await fetch(`${API_BASE}/home?host=moviebox.ph`, { headers: DEFAULT_HEADERS });
  const x = r.headers.get("x-user");
  try { await r.body?.cancel(); } catch { /* ignore */ }
  if (x) {
    try {
      const t = JSON.parse(x)?.token;
      if (t) { cachedToken = t; return t; }
    } catch { /* ignore */ }
  }
  return "";
}

async function api(url: string, method: "GET" | "POST" = "GET", payload?: unknown): Promise<any> {
  const token = await getToken();
  const headers = { ...DEFAULT_HEADERS, Authorization: token ? `Bearer ${token}` : "" };
  const resp = await fetch(url, {
    method,
    headers,
    body: method === "POST" ? JSON.stringify(payload ?? {}) : undefined,
  });
  const nx = resp.headers.get("x-user");
  if (nx) {
    try {
      const t = JSON.parse(nx)?.token;
      if (t) cachedToken = t;
    } catch { /* ignore */ }
  }
  if (!resp.ok) throw new Error(`Upstream ${resp.status}`);
  return await resp.json();
}

function norm(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function similarity(a: string, b: string): number {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const wa = new Set(na.split(" ")), wb = new Set(nb.split(" "));
  let common = 0;
  for (const w of wa) if (wb.has(w)) common++;
  return common / Math.max(wa.size, wb.size);
}

interface Candidate {
  subjectId: string;
  detailPath: string;
  title: string;
  releaseDate?: string;
  subjectType?: number;
  hasResource?: boolean;
  cover?: { url?: string };
}

async function search(keyword: string): Promise<Candidate[]> {
  const data = await api(`${API_BASE}/subject/search`, "POST", { keyword, page: 1, perPage: 20 });
  const inner = data?.data || {};
  const raw: any[] = inner.items || inner.list || [];
  return raw.map((r: any) => {
    const sub = r.subject || r;
    return {
      subjectId: sub.subjectId || sub.id,
      detailPath: sub.detailPath || sub.detail_path,
      title: sub.title || sub.name,
      releaseDate: sub.releaseDate || sub.release_date,
      subjectType: sub.subjectType || sub.subject_type,
      hasResource: sub.hasResource,
      cover: sub.cover,
    };
  }).filter((c) => c.subjectId && c.detailPath && c.title);
}

async function getDomain(): Promise<string> {
  try {
    const d = await api(`${API_BASE}/media-player/get-domain`);
    return String(d?.data || "https://netfilm.world").replace(/\/$/, "");
  } catch {
    return "https://netfilm.world";
  }
}

async function play(subjectId: string, detailPath: string, se: number, ep: number): Promise<any> {
  const domain = await getDomain();
  const referer =
    `${domain}/spa/videoPlayPage/movies/${detailPath}?id=${subjectId}&type=/movie/detail&detailSe=${se}&detailEp=${ep}&lang=en`;
  const url = `${domain}/wefeed-h5api-bff/subject/play?subjectId=${subjectId}&se=${se}&ep=${ep}&detailPath=${detailPath}`;
  const token = await getToken();
  const resp = await fetch(url, {
    headers: {
      ...PLAYER_HEADERS,
      Referer: referer,
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  if (!resp.ok) throw new Error(`play ${resp.status}`);
  const json = await resp.json();
  return json?.data || {};
}

function proxied(reqUrl: URL, target: string): string {
  const p = new URL(`https://${reqUrl.hostname}/functions/v1/proxy`);
  p.searchParams.set("any", "1");
  p.searchParams.set("url", target);
  return p.toString();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, reason: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body?.title || "").trim();
    const year = body?.year ? String(body.year).slice(0, 4) : "";
    const mediaType = String(body?.mediaType || "movie");
    const se = Number.isFinite(+body?.season) && +body.season > 0 ? +body.season : 1;
    const ep = Number.isFinite(+body?.episode) && +body.episode > 0 ? +body.episode : 1;

    if (!title || title.length > 200) {
      return new Response(JSON.stringify({ ok: false, reason: "Invalid title" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const items = await search(title);
    if (!items.length) {
      return new Response(JSON.stringify({ ok: false, reason: "Not found on MovieBox" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rank candidates
    const preferredType = mediaType === "movie" ? 1 : 2;
    const ranked = items
      .map((it) => {
        let s = similarity(title, it.title);
        if (it.subjectType === preferredType) s += 0.25;
        if (year && it.releaseDate?.slice(0, 4) === year) s += 0.25;
        if (it.hasResource) s += 0.1;
        return { it, s };
      })
      .sort((a, b) => b.s - a.s);

    // Try top candidates until one yields playable streams
    const reqUrl = new URL(req.url);
    for (const { it } of ranked.slice(0, 4)) {
      try {
        const data = await play(it.subjectId, it.detailPath, se, ep);
        const streams: any[] = data?.streams || [];
        const hls: any[] = data?.hls || [];

        // Prefer HLS
        const hlsPick = hls.find((h) => h?.url);
        if (hlsPick?.url) {
          return new Response(JSON.stringify({
            ok: true,
            kind: "hls",
            url: proxied(reqUrl, hlsPick.url),
            poster: it.cover?.url || null,
            title: it.title,
            captions: (data?.captions || []).filter((c: any) => c?.url).map((c: any) => ({
              lang: c.lan || c.language || c.lanName || "und",
              url: proxied(reqUrl, c.url),
            })),
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // Highest-resolution MP4
        const mp4s = streams
          .filter((s) => s?.url)
          .sort((a, b) => (Number(b.resolutions) || 0) - (Number(a.resolutions) || 0));
        const mp4 = mp4s[0];
        if (mp4?.url) {
          return new Response(JSON.stringify({
            ok: true,
            kind: "mp4",
            url: proxied(reqUrl, mp4.url),
            poster: it.cover?.url || null,
            title: it.title,
            captions: (data?.captions || []).filter((c: any) => c?.url).map((c: any) => ({
              lang: c.lan || c.language || c.lanName || "und",
              url: proxied(reqUrl, c.url),
            })),
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch (e) {
        console.warn("play failed for", it.title, e instanceof Error ? e.message : e);
      }
    }

    return new Response(JSON.stringify({ ok: false, reason: "No playable stream available yet" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("moviebox-api error:", err instanceof Error ? err.message : err);
    return new Response(JSON.stringify({ ok: false, reason: "MovieBox is temporarily unavailable" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
