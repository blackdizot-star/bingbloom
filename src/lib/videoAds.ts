export const VIDEO_AD_ID = "qbVq3I_fjSE";

export const VIDEO_AD_IDS = [VIDEO_AD_ID] as const;

export const videoAdFor = (_seed?: string | number) => VIDEO_AD_ID;

export const videoAdEmbedUrl = (videoId: string = VIDEO_AD_ID, loop = false) => {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "0",
    controls: "0",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
  });
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};
