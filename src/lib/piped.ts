const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function pipedFetch(path: string): Promise<any> {
  const url = `${SUPABASE_URL}/functions/v1/piped-proxy?path=${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Proxy returned ${res.status}: ${body}`);
  }
  return res.json();
}

export interface PipedVideo {
  url: string;
  title: string;
  thumbnail: string;
  uploaderName: string;
  uploaderUrl: string;
  uploadedDate: string;
  duration: number;
  views: number;
  uploaderAvatar: string;
  shortDescription?: string;
}

export interface PipedStream {
  title: string;
  description: string;
  uploadDate: string;
  uploader: string;
  uploaderUrl: string;
  uploaderAvatar: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: number;
  hls?: string;
  videoStreams: { url: string; quality: string; mimeType: string }[];
  audioStreams: { url: string; quality: string; mimeType: string }[];
  relatedStreams: PipedVideo[];
}

export async function searchPiped(query: string): Promise<PipedVideo[]> {
  try {
    const data = await pipedFetch(`/search?q=${encodeURIComponent(query)}&filter=videos`);
    return data.items || [];
  } catch (e) {
    console.error("Piped search failed:", e);
    return [];
  }
}

export async function getTrending(): Promise<PipedVideo[]> {
  try {
    const data = await pipedFetch(`/trending?region=US`);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Piped trending failed:", e);
    return [];
  }
}

export async function getStreamData(videoId: string): Promise<PipedStream | null> {
  try {
    return await pipedFetch(`/streams/${videoId}`);
  } catch (e) {
    console.error("Piped stream failed:", e);
    return null;
  }
}

export interface PipedComment {
  author: string;
  commentText: string;
  commentedTime: string;
  commentorUrl: string;
  likeCount: number;
  thumbnail: string;
  hearted: boolean;
  pinned: boolean;
  repliesPage?: string;
}

export interface PipedCommentsResponse {
  comments: PipedComment[];
  nextpage?: string;
  disabled: boolean;
}

export async function getComments(videoId: string, nextpage?: string): Promise<PipedCommentsResponse> {
  try {
    const path = nextpage
      ? `/nextpage/comments/${videoId}?nextpage=${encodeURIComponent(nextpage)}`
      : `/comments/${videoId}`;
    const data = await pipedFetch(path);
    return {
      comments: data.comments || [],
      nextpage: data.nextpage || null,
      disabled: data.disabled || false,
    };
  } catch (e) {
    console.error("Piped comments failed:", e);
    return { comments: [], disabled: true };
  }
}

export async function getChannelVideos(channelId: string): Promise<PipedVideo[]> {
  try {
    const data = await pipedFetch(`/channel/${channelId}`);
    return data.relatedStreams || [];
  } catch (e) {
    console.error("Piped channel failed:", e);
    return [];
  }
}

export function extractVideoId(url: string): string {
  return url.replace("/watch?v=", "");
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  return `${views} views`;
}

// Global trending content categories used across the app.
export const KENYAN_CATEGORIES = {
  trending: "trending now 2026",
  movies: "full movie 2026 HD",
  moviesNew: "new movies 2026 full",
  moviesAction: "best action movies full",
  moviesRomance: "best romance movies full",
  moviesDrama: "best drama movies full",
  realityShows: "top reality shows 2026",
  realityDating: "best dating reality show",
  realityCompetition: "competition reality show",
  musicVideos: "top music videos 2026",
  comedy: "stand up comedy specials",
  gospel: "gospel music worship",
  genge: "afrobeats hits playlist",
  djAro: "movie mix compilation full",
  drama: "drama series 2026 full episodes",
  hiphop: "hip hop hits 2026",
  afrobeat: "afrobeat hits 2026",
  benga: "indie music live",
  talkShows: "celebrity talk show interview",
  thriller: "thriller movie full HD",
};
