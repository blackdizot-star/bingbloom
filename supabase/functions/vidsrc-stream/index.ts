// vidsrc-stream
// Resolves a TMDB or IMDb id (movie / tv episode) into a direct playable
// HLS/MP4 source. No iframe/embed fallback is returned.
//
// Response shape:
//   { ok: true, kind: "hls" | "mp4", streamUrl, source, diagnostics }
//   { ok: false, error, diagnostics }

import { createClient } from "npm:@supabase/supabase-js@2";

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
  imdb_id?: string | null;
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

function proxied(reqUrl: URL, target: string): string {
  const p = new URL(`https://${reqUrl.hostname}/functions/v1/proxy`);
  p.searchParams.set("any", "1");
  p.searchParams.set("url", target);
  return p.toString();
}

async function storeStream(
  tmdbId: string,
  type: "movie" | "tv",
  source: string,
  streamUrl: string,
  season?: string,
  episode?: string,
) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) return;
    const db = createClient(supabaseUrl, serviceKey);
    await db.rpc("record_stream_source", {
      p_tmdb_id: tmdbId,
      p_media_type: type,
      p_server: source.slice(0, 50),
      p_url: streamUrl.slice(0, 2000),
      p_working: true,
      p_season: type === "tv" ? Number(season || 1) : null,
      p_episode: type === "tv" ? Number(episode || 1) : null,
    });
  } catch (e) {
    console.warn("stream cache write failed", e instanceof Error ? e.message : e);
  }
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

async function resolveExternalIds(
  rawId: string,
  type: "movie" | "tv",
): Promise<{ tmdbId: string | null; imdbId: string | null }> {
  if (rawId.startsWith("tt")) {
    return { tmdbId: await resolveTmdbId(rawId, type), imdbId: rawId };
  }
  if (!TMDB_KEY) return { tmdbId: rawId, imdbId: null };
  try {
    const r = await fetch(`https://api.themoviedb.org/3/${type}/${rawId}/external_ids?api_key=${TMDB_KEY}`);
    if (!r.ok) return { tmdbId: rawId, imdbId: null };
    const data = await r.json();
    return { tmdbId: rawId, imdbId: data?.imdb_id || null };
  } catch {
    return { tmdbId: rawId, imdbId: null };
  }
}

function absoluteUrl(value: string, base: string): string {
  if (value.startsWith("//")) return `https:${value}`;
  return new URL(value, base).toString();
}

async function fetchText(url: string, referer: string): Promise<{ url: string; text: string } | null> {
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Referer: referer,
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    if (!r.ok) return null;
    return { url: r.url, text: await r.text() };
  } catch {
    return null;
  }
}

async function resolveVsembed(
  id: string,
  type: "movie" | "tv",
  season?: string,
  episode?: string,
): Promise<string | null> {
  const start = type === "tv"
    ? `https://vsembed.ru/embed/tv/${id}/${season}/${episode}/`
    : `https://vsembed.ru/embed/movie/${id}/`;
  const inner = await fetchText(start, "https://vidsrc.to/");
  if (!inner) return null;
  const rcpRaw = extractFirstIframe(inner.text) || extractProrcpPath(inner.text);
  if (!rcpRaw) return await extractPlayerStream(inner.text) || extractDirectMedia(inner.text);
  const rcp = await fetchText(absoluteUrl(rcpRaw, inner.url), inner.url);
  if (!rcp) return null;
  const prorcpRaw = extractProrcpPath(rcp.text);
  const player = prorcpRaw ? await fetchText(absoluteUrl(prorcpRaw, rcp.url), rcp.url) : rcp;
  return player ? await extractPlayerStream(player.text) || extractDirectMedia(player.text) : null;
}

function extractFirstIframe(html: string): string | null {
  return html.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1] || null;
}

function extractProrcpPath(html: string): string | null {
  return html.match(/src\s*:\s*["']([^"']*\/prorcp\/[^"']+)["']/i)?.[1] ||
    html.match(/<iframe[^>]+src=["']([^"']*\/prorcp\/[^"']+)["']/i)?.[1] ||
    null;
}

function extractDirectMedia(html: string): string | null {
  return html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i)?.[0]?.replace(/&amp;/g, "&") ||
    html.match(/https?:\/\/[^"'\s<>]+\.(?:mp4|webm|mov)(?:\?[^"'\s<>]*)?/i)?.[0]?.replace(/&amp;/g, "&") ||
    null;
}

async function fillPlayerTokens(masterUrls: string): Promise<string> {
  let out = masterUrls;
  if (out.includes("__TOKENPG__")) {
    try {
      const token = await fetch("https://app2.putgate.com/generate.php", {
        headers: { "User-Agent": UA, Referer: "https://cloudorchestranova.com/" },
      }).then((r) => r.ok ? r.text() : "");
      if (token) out = out.replaceAll("__TOKENPG__", token.trim());
    } catch { /* ignore */ }
  }
  if (out.includes("__TOKEN__")) {
    try {
      const token = await fetch("https://veldtvolition.website/generate.php", {
        headers: { "User-Agent": UA, Referer: "https://cloudorchestranova.com/" },
      }).then((r) => r.ok ? r.text() : "");
      if (token) out = out.replaceAll("__TOKEN__", token.trim());
    } catch { /* ignore */ }
  }
  return out;
}

async function extractPlayerStream(html: string): Promise<string | null> {
  const master = html.match(/var\s+master_urls\s*=\s*"([^"]+)"/i)?.[1] ||
    html.match(/file\s*:\s*"([^"]+\.m3u8[^"]*)"/i)?.[1] ||
    null;
  if (master) {
    const filled = await fillPlayerTokens(master);
    const candidates = filled.split(/\s+or\s+/i).map((s) => s.trim()).filter(Boolean);
    return candidates.find((u) => u.includes(".m3u8") && !u.includes("__TOKEN")) || null;
  }
  const direct = extractDirectMedia(html);
  if (!direct || direct.includes("__TOKEN")) return null;
  return direct;
}

async function resolveVidSrcTo(
  id: string,
  type: "movie" | "tv",
  season?: string,
  episode?: string,
): Promise<string | null> {
  const start = type === "tv"
    ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
    : `https://vidsrc.to/embed/movie/${id}`;
  const outer = await fetchText(start, "https://vidsrc.to/");
  if (!outer) return null;
  const innerRaw = extractFirstIframe(outer.text);
  if (!innerRaw) return extractDirectMedia(outer.text);
  const innerUrl = absoluteUrl(innerRaw, outer.url);
  const inner = await fetchText(innerUrl, start);
  if (!inner) return null;
  const rcpRaw = extractFirstIframe(inner.text) || extractProrcpPath(inner.text);
  if (!rcpRaw) return extractPlayerStream(inner.text);
  const rcpUrl = absoluteUrl(rcpRaw, inner.url);
  const rcp = await fetchText(rcpUrl, inner.url);
  if (!rcp) return null;
  const prorcpRaw = extractProrcpPath(rcp.text);
  const playerUrl = prorcpRaw ? absoluteUrl(prorcpRaw, rcp.url) : rcp.url;
  const player = prorcpRaw ? await fetchText(playerUrl, rcp.url) : rcp;
  if (!player) return null;
  return await extractPlayerStream(player.text);
}

async function resolveVidSrcSbs(
  tmdbId: string,
  type: "movie" | "tv",
  season?: string,
  episode?: string,
): Promise<string | null> {
  const start = type === "tv"
    ? `https://vidsrc.sbs/embed/series/${tmdbId}/${season}/${episode}`
    : `https://vidsrc.sbs/embed/movie/${tmdbId}`;
  const outer = await fetchText(start, "https://vidsrc.sbs/");
  if (!outer) return null;
  return await extractPlayerStream(outer.text) || extractDirectMedia(outer.text);
}

async function resolveVidScrPm(
  id: string,
  type: "movie" | "tv",
  season?: string,
  episode?: string,
): Promise<string | null> {
  const start = type === "tv"
    ? `https://vidscr.pm/embed/tv/${id}/${season}/${episode}`
    : `https://vidscr.pm/embed/movie/${id}`;
  const outer = await fetchText(start, "https://vidscr.pm/");
  if (!outer) return null;
  const direct = extractDirectMedia(outer.text) || await extractPlayerStream(outer.text);
  if (direct) return direct;
  const innerRaw = extractFirstIframe(outer.text) || extractProrcpPath(outer.text);
  if (!innerRaw) return null;
  const inner = await fetchText(absoluteUrl(innerRaw, outer.url), start);
  return inner ? await extractPlayerStream(inner.text) || extractDirectMedia(inner.text) : null;
}

// ---------- Legacy direct scrape kept as a low priority last attempt ----------
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
    const download = url.searchParams.get("download") === "true" || url.searchParams.get("download") === "1";
    const proxy = url.searchParams.get("proxy") === "1";


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


    // 1) Resolve to numeric TMDB id and IMDb id where possible
    const ids = await resolveExternalIds(rawId, type);
    const tmdbId = ids.tmdbId;
    const imdbId = ids.imdbId;
    if (!tmdbId) {
      diag.attempted.push({
        source: "tmdb-find",
        ok: false,
        reason: rawId.startsWith("tt")
          ? "IMDb→TMDB lookup failed (check TMDB_API_KEY)"
          : "Invalid id",
      });
      diag.ms = Date.now() - t0;
      return respond({ ok: false, error: "TMDB lookup failed", diagnostics: diag });
    }
    diag.resolved_tmdb_id = tmdbId;
    diag.imdb_id = imdbId;

    const attempts: { name: string; run: () => Promise<string | null> }[] = [
      ...(imdbId ? [{ name: "VidScr PM", run: () => resolveVidScrPm(imdbId, type, season, episode) }] : []),
      ...(imdbId ? [{ name: "VSEmbed direct", run: () => resolveVsembed(imdbId, type, season, episode) }] : []),
      { name: "VidSrc.to", run: () => resolveVidSrcTo(imdbId || tmdbId, type, season, episode) },
      { name: "VidSrc.sbs", run: () => resolveVidSrcSbs(tmdbId, type, season, episode) },
      { name: "VidSrc.xyz", run: () => scrapeVidsrcXyz(tmdbId, type, season, episode) },
    ];

    for (const attempt of attempts) {
      try {
        const stream = await attempt.run();
        if (!stream) {
          diag.attempted.push({ source: attempt.name, ok: false, reason: "no direct HLS/MP4 found" });
          continue;
        }
        const proxiedStream = proxied(url, stream);
        await storeStream(tmdbId, type, attempt.name, proxiedStream, season, episode);
        diag.attempted.push({ source: attempt.name, ok: true });
        diag.ms = Date.now() - t0;
        return respond({
          ok: true,
          kind: stream.split("?")[0].toLowerCase().endsWith(".mp4") ? "mp4" : "hls",
          streamUrl: proxiedStream,
          source: attempt.name,
          diagnostics: diag,
        });
      } catch (e) {
        diag.attempted.push({
          source: attempt.name,
          ok: false,
          reason: e instanceof Error ? e.message : String(e),
        });
      }
    }

    diag.ms = Date.now() - t0;
    return respond({ ok: false, error: "No direct playable HLS/MP4 stream found", diagnostics: diag });
  } catch (err) {
    diag.ms = Date.now() - t0;
    return respond({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      diagnostics: diag,
    });
  }
});
