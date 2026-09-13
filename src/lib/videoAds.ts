export const VIDEO_AD_IDS = [
  "AK8s3iqL99c",
  "qbVq3I_fjSE",
  "YzVYyDehMUY",
  "qk3T58Pai18",
  "twd6fz0pfGA",
] as const;

export const videoAdFor = (seed: string | number) => {
  const value = String(seed);
  const hash = Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0);
  return VIDEO_AD_IDS[hash % VIDEO_AD_IDS.length];
};

export const videoAdEmbedUrl = (videoId: string, loop = false) => {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
  });
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};