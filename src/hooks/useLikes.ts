import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useLikeCount(videoId: string | undefined) {
  const [count, setCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    if (!videoId) return;
    const { data } = await (supabase as any)
      .from("likes")
      .select("count")
      .eq("video_id", videoId)
      .maybeSingle();
    if (data) setCount(data.count);
  }, [videoId]);

  useEffect(() => {
    fetchCount();
    // Check localStorage for user's like state
    const likedIds: string[] = JSON.parse(localStorage.getItem("db_liked_ids") || "[]");
    setUserLiked(likedIds.includes(videoId || ""));
  }, [videoId, fetchCount]);

  // Realtime subscription
  useEffect(() => {
    if (!videoId) return;
    const channel = supabase
      .channel(`likes-${videoId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "likes",
        filter: `video_id=eq.${videoId}`,
      }, (payload: any) => {
        if (payload.new?.count != null) setCount(payload.new.count);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [videoId]);

  const toggleLike = useCallback(async () => {
    if (!videoId || loading) return;
    setLoading(true);
    const likedIds: string[] = JSON.parse(localStorage.getItem("db_liked_ids") || "[]");
    const wasLiked = likedIds.includes(videoId);
    const newCount = wasLiked ? Math.max(0, count - 1) : count + 1;

    // Optimistic update
    setCount(newCount);
    setUserLiked(!wasLiked);

    // Update localStorage
    const updated = wasLiked ? likedIds.filter((id) => id !== videoId) : [...likedIds, videoId];
    localStorage.setItem("db_liked_ids", JSON.stringify(updated));

    // Controlled +/-1 update via secure edge function
    const { error } = await supabase.functions.invoke("toggle-like", {
      body: { videoId, delta: wasLiked ? -1 : 1 },
    });

    if (error) {
      // Revert on error
      setCount(count);
      setUserLiked(wasLiked);
      localStorage.setItem("db_liked_ids", JSON.stringify(likedIds));
    }
    setLoading(false);
  }, [videoId, count, loading]);

  return { count, userLiked, toggleLike, loading };
}
