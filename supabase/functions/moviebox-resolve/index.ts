// moviebox-resolve: resolves direct MP4 download URLs from the MovieBox REST API.
// Reimplements the auth -> search -> download flow of the `moviebox-api` Python lib.
//
// POST { title, year?, mediaType: "movie"|"tv"|"anime", season?, episode? }
// -> { ok, title, year, downloads: [{resolution,url,size,format}], captions: [{lang,url}] }
//
// The browser cannot call MovieBox directly (it requires a Referer header the
// browser is not allowed to set, and an auth token). This edge function does it
// server-side. The returned MP4 URLs must still be fetched through the `proxy`
// edge function, which injects the required Referer for the CDN.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const API = "https://h5-api.aoneroom.com";
const UA =
  "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0";
const X_CLIENT_INFO = '{"timezone":"Africa/Nairobi"}';

interface SearchItem {
  subjectId: string;
  subjectType: number;
  title: string;
  releaseDate?: string;
  detailPath?: string;
  hasResource?: boolean;
  cover?: { url?: string };
  subtitles?: string;
}

function normalize(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const wa = new Set(na.split(" "));
  const wb = new Set(nb.split(" "));
  let common = 0;
  for (const w of wa) if (wb.has(w)) common++;
  return common / Math.max(wa.size, wb.size);
}

// Step 1: obtain a bearer token via the search-suggest endpoint, which returns
// the token in the `x-user` response header.
async function getToken(): Promise<string> {
  const res = await fetch(`${API}/wefeed-h5api-bff/subject/search-suggest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://moviebox.ph/",
      "X-Client-Info": X_CLIENT_INFO,
      "User-Agent": UA,
    },
    body: JSON.stringify({ keyword: "avatar", perPage: 0 }),
  });
  const xUser = res.headers.get("x-user");
  try {
    await res.body?.cancel();
  } catch { /* ignore */ }
  if (!xUser) throw new Error("Could not obtain MovieBox auth token");
  const parsed = JSON.parse(xUser);
  if (!parsed?.token) throw new Error("MovieBox token missing");
  return parsed.token as string;
}

async function search(token: string, keyword: string): Promise<SearchItem[]> {
  const res = await fetch(`${API}/wefeed-h5api-bff/subject/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://moviebox.ph/",
      Authorization: `Bearer ${token}`,
      "X-Client-Info": X_CLIENT_INFO,
      "User-Agent": UA,
    },
    body: JSON.stringify({ keyword, page: 1, perPage: 12 }),
  });
  const json = await res.json();
  return (json?.data?.items as SearchItem[]) || [];
}

async function getDownloads(
  token: string,
  item: SearchItem,
  season: number,
  episode: number,
) {
  const params = new URLSearchParams({
    subjectId: item.subjectId,
    se: String(season),
    ep: String(episode),
    detailPath: item.detailPath || "",
  });
  const res = await fetch(
    `${API}/wefeed-h5api-bff/subject/download?${params.toString()}`,
    {
      headers: {
        Referer: "https://videodownloader.site/",
        Authorization: `Bearer ${token}`,
        "X-Client-Info": X_CLIENT_INFO,
        "User-Agent": UA,
      },
    },
  );
  const json = await res.json();
  return json?.data || { downloads: [], captions: [] };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, reason: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body?.title || "").trim();
    const mediaType = String(body?.mediaType || "movie");
    const year = body?.year ? String(body.year).slice(0, 4) : "";
    const season = Number.isFinite(+body?.season) ? Math.max(0, +body.season) : 0;
    const episode = Number.isFinite(+body?.episode) ? Math.max(0, +body.episode) : 0;

    if (!title || title.length > 200) {
      return new Response(JSON.stringify({ ok: false, reason: "Invalid title" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["movie", "tv", "anime"].includes(mediaType)) {
      return new Response(JSON.stringify({ ok: false, reason: "Invalid mediaType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getToken();
    const items = await search(token, title);
    if (items.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, reason: "No results found on Fast Downloads" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // movie -> subjectType 1, series/anime -> subjectType 2 (preferred but not forced)
    const preferredType = mediaType === "movie" ? 1 : 2;
    const ranked = items
      .map((it) => {
        let score = similarity(title, it.title);
        if (it.subjectType === preferredType) score += 0.25;
        if (year && it.releaseDate?.slice(0, 4) === year) score += 0.2;
        if (it.hasResource) score += 0.1;
        return { it, score };
      })
      .sort((a, b) => b.score - a.score);

    // Try the best few candidates until one yields downloads.
    let chosen: SearchItem | null = null;
    let data: any = null;
    for (const { it } of ranked.slice(0, 4)) {
      const d = await getDownloads(token, it, season, episode);
      if (d?.downloads?.length > 0) {
        chosen = it;
        data = d;
        break;
      }
      if (!chosen) {
        chosen = it;
        data = d;
      }
    }

    const downloads = (data?.downloads || [])
      .filter((d: any) => d?.url)
      .map((d: any) => ({
        resolution: Number(d.resolution) || 0,
        url: d.url as string,
        size: Number(d.size) || 0,
        format: d.format || "MP4",
      }))
      .sort((a: any, b: any) => b.resolution - a.resolution);

    const captions = (data?.captions || [])
      .filter((c: any) => c?.url)
      .map((c: any) => ({ lang: c.lan || c.language || c.lanName || "Unknown", url: c.url }));

    if (downloads.length === 0) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "No downloadable file available from Fast Downloads for this title.",
          title: chosen?.title || title,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        title: chosen?.title || title,
        year: chosen?.releaseDate?.slice(0, 4) || year,
        poster: chosen?.cover?.url || null,
        downloads,
        captions,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("moviebox-resolve error:", err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ ok: false, reason: "Fast Downloads is temporarily unavailable. Try again." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
