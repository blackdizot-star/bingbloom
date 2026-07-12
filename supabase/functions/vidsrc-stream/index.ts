// vidsrc-stream
// Resolves a TMDB or IMDb id (movie / tv episode) into a playable source.
// Always returns 200 with { ok, ... } so the client can read the body.
//
// Response shape:
//   { ok: true, kind: "hls" | "embed", streamUrl, source, diagnostics }
//   { ok: false, error, diagnostics }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const TMDB_KEY = Deno.env.get("TMDB_API_KEY") || "";

interface Diag {
  input_id?: string;
  resolved_tmdb_id?: string;
  attempted: { source: string; ok: boolean; reason?: string }[];
  ms?: number;
}

function isDownloadableUrl(url: string): boolean {
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov");
}

// Block requests to private / internal / link-local addresses to prevent SSRF
// (e.g. cloud metadata at 169.254.169.254).
function isBlockedAddress(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    h === "localhost" ||
    h === "ip6-localhost" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h === "metadata.google.internal"
  ) {
    return true;
  }
  if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("::ffff:")) {
    return true;
  }
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const o = m.slice(1).map(Number);
    if (o.some((n) => n > 255)) return true;
    const [a, b] = o;
    if (a === 0 || a === 127 || a === 10) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 192 && b === 0) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
    if (a >= 224) return true;
  }
  return false;
}

// Only allow proxying http(s) URLs to non-internal hosts.
function isSafeTarget(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    if (!u.hostname) return false;
    return !isBlockedAddress(u.hostname);
  } catch {
    return false;
  }
}

function respond(payload: Record<string, unknown>) {
  // Auto-tag downloadable flag based on streamUrl extension. HLS (.m3u8) and
  // iframe embeds are not directly downloadable.
  if (typeof payload.streamUrl === "string" && payload.downloadable === undefined) {
    payload.downloadable = payload.kind === "hls"
      ? false
      : isDownloadableUrl(payload.streamUrl as string);
  }
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=120",
    },
  });
}

// ---------- Convert IMDb -> TMDB if needed ----------
async function resolveTmdbId(
  rawId: string,
  type: "movie" | "tv",
): Promise<string | null> {
  if (!rawId.startsWith("tt")) return rawId; // already TMDB numeric
  if (!TMDB_KEY) return null;
  try {
    const url = `https://api.themoviedb.org/3/find/${rawId}?api_key=${TMDB_KEY}&external_source=imdb_id`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const data = await r.json();
    const arr = type === "tv" ? data.tv_results : data.movie_results;
    return arr?.[0]?.id ? String(arr[0].id) : null;
  } catch {
    return null;
  }
}

// ---------- Try to scrape vidsrc.xyz for a direct .m3u8 ----------
async function scrapeVidsrcXyz(
  tmdbId: string,
  type: "movie" | "tv",
  season?: string,
  episode?: string,
): Promise<string | null> {
  const url =
    type === "tv"
      ? `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
      : `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Referer: "https://vidsrc.xyz/" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const iframe =
      html.match(/src="([^"]*prorcp[^"]*)"/) ||
      html.match(/src="(\/\/[^"]+rcp[^"]+)"/);
    if (!iframe) return null;
    let inner = iframe[1];
    if (inner.startsWith("//")) inner = "https:" + inner;
    if (inner.startsWith("/")) inner = "https://vidsrc.xyz" + inner;
    const innerRes = await fetch(inner, {
      headers: { "User-Agent": UA, Referer: url },
    });
    if (!innerRes.ok) return null;
    const innerHtml = await innerRes.text();
    const m3u8 = innerHtml.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
    return m3u8 ? m3u8[0] : null;
  } catch {
    return null;
  }
}

// ---------- Embed-URL fallback (always works in an iframe) ----------
const EMBED_DOMAINS = [
  "vidsrc.pm",
  "vidsrc.to",
  "vidsrc.xyz",
  "vidsrc.net",
  "vidsrc.in",
  "vidsrc.cc",
  "2embed.cc",
  "autoembed.co",
] as const;

function embedUrl(
  tmdbId: string,
  type: "movie" | "tv",
  season?: string,
  episode?: string,
  domain: string = "vidsrc.pm",
): string {
  // 2embed and autoembed have different URL shapes
  if (domain === "2embed.cc") {
    return type === "tv"
      ? `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`
      : `https://www.2embed.cc/embed/${tmdbId}`;
  }
  if (domain === "autoembed.co") {
    return type === "tv"
      ? `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}?autoplay=1`
      : `https://player.autoembed.cc/embed/movie/${tmdbId}?autoplay=1`;
  }
  // vidsrc.* family
  if (type === "tv") {
    return `https://${domain}/embed/tv/${tmdbId}/${season}/${episode}?autoplay=1`;
  }
  return `https://${domain}/embed/movie/${tmdbId}?autoplay=1`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const t0 = Date.now();
  const diag: Diag = { attempted: [] };

  try {
    const url = new URL(req.url);
    const rawId = url.searchParams.get("tmdbId") || "";
    const type = (url.searchParams.get("type") || "movie") as "movie" | "tv";
    const season = url.searchParams.get("season") || undefined;
    const episode = url.searchParams.get("episode") || undefined;
    const requestedDomain = url.searchParams.get("domain") || "vidsrc.pm";
    const forceEmbed = url.searchParams.get("forceEmbed") === "1";
    const download = url.searchParams.get("download") === "true" || url.searchParams.get("download") === "1";
    const proxy = url.searchParams.get("proxy") === "1";
    const domain = (EMBED_DOMAINS as readonly string[]).includes(requestedDomain)
      ? requestedDomain
      : "vidsrc.pm";


    diag.input_id = rawId;

    // Range-aware pass-through proxy. Used by the offline downloader to bypass CORS
    // when fetching MP4 chunks from upstream CDNs.
    if (proxy) {
      const target = url.searchParams.get("url");
      if (!target) {
        return new Response(JSON.stringify({ error: "missing url" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!isSafeTarget(target)) {
        return new Response(JSON.stringify({ error: "url not allowed" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const fwdHeaders: Record<string, string> = {
        "User-Agent": UA,
        Referer: "https://vidsrc.pm/",
      };
      const range = req.headers.get("range");
      if (range) fwdHeaders["Range"] = range;
      const upstream = await fetch(target, { headers: fwdHeaders });
      const headers: Record<string, string> = { ...corsHeaders };
      const ct = upstream.headers.get("content-type");
      const cl = upstream.headers.get("content-length");
      const cr = upstream.headers.get("content-range");
      const ar = upstream.headers.get("accept-ranges");
      if (ct) headers["Content-Type"] = ct;
      if (cl) headers["Content-Length"] = cl;
      if (cr) headers["Content-Range"] = cr;
      headers["Accept-Ranges"] = ar || "bytes";
      headers["Access-Control-Expose-Headers"] = "Content-Length, Content-Range, Accept-Ranges";
      if (download) {
        const fn = (url.searchParams.get("filename") || `bingbloom-${rawId}.mp4`).replace(/[^a-zA-Z0-9._-]/g, "_");
        headers["Content-Disposition"] = `attachment; filename="${fn}"`;
      }
      return new Response(upstream.body, { status: upstream.status, headers });
    }

    if (!rawId) {
      return respond({ ok: false, error: "Missing tmdbId", diagnostics: diag });
    }
    if (type === "tv" && (!season || !episode)) {
      return respond({
        ok: false,
        error: "season and episode required for tv",
        diagnostics: diag,
      });
    }


    // 1) Resolve to numeric TMDB id
    const tmdbId = await resolveTmdbId(rawId, type);
    if (!tmdbId) {
      diag.attempted.push({
        source: "tmdb-find",
        ok: false,
        reason: rawId.startsWith("tt")
          ? "IMDb→TMDB lookup failed (check TMDB_API_KEY)"
          : "Invalid id",
      });
      // Fall back to embed using raw id — vidsrc.to also accepts IMDb ids
      const fallback = embedUrl(rawId, type, season, episode, domain);
      diag.ms = Date.now() - t0;
      return respond({
        ok: true,
        kind: "embed",
        streamUrl: fallback,
        source: `${domain} (embed, raw id)`,
        diagnostics: diag,
      });
    }
    diag.resolved_tmdb_id = tmdbId;

    // 2) Try direct HLS scrape unless caller asked to skip
    if (!forceEmbed) {
      const hls = await scrapeVidsrcXyz(tmdbId, type, season, episode);
      if (hls) {
        diag.attempted.push({ source: "vidsrc.xyz", ok: true });
        diag.ms = Date.now() - t0;
        return respond({
          ok: true,
          kind: "hls",
          streamUrl: hls,
          source: "vidsrc.xyz",
          diagnostics: diag,
        });
      }
      diag.attempted.push({
        source: "vidsrc.xyz",
        ok: false,
        reason: "no m3u8 in page",
      });
    } else {
      diag.attempted.push({ source: "hls-skip", ok: true, reason: "forceEmbed" });
    }

    // 3) Embed fallback (iframe) — always returns something playable
    const fallback = embedUrl(tmdbId, type, season, episode, domain);
    diag.attempted.push({ source: `${domain} (embed)`, ok: true });
    diag.ms = Date.now() - t0;
    return respond({
      ok: true,
      kind: "embed",
      streamUrl: fallback,
      source: `${domain} (embed)`,
      diagnostics: diag,
    });
  } catch (err) {
    diag.ms = Date.now() - t0;
    return respond({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      diagnostics: diag,
    });
  }
});
