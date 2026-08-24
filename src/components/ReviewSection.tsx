import { useState, useEffect, useCallback } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserComment {
  id: string;
  video_id: string;
  author_name: string;
  comment_text: string;
  created_at: string;
}

const ReviewSection = ({ videoId }: { videoId: string }) => {
  const [reviews, setReviews] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [posting, setPosting] = useState(false);

  const userName = (() => {
    try {
      const p = JSON.parse(localStorage.getItem("user_profile") || "{}");
      return p.firstName ? `${p.firstName} ${p.lastName || ""}`.trim() : "Anonymous";
    } catch { return "Anonymous"; }
  })();

  const fetchReviews = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("comments")
      .select("*")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false })
      .limit(50);
    setReviews((data as UserComment[]) || []);
    setLoading(false);
  }, [videoId]);

  useEffect(() => {
    fetchReviews();
    const channel = supabase
      .channel(`reviews-${videoId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `video_id=eq.${videoId}` },
        (payload: any) => { setReviews((prev) => [payload.new as UserComment, ...prev]); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [videoId, fetchReviews]);

  const postReview = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please sign in to post a review.");
      setPosting(false);
      return;
    }
    const starPrefix = rating > 0 ? `${"★".repeat(rating)}${"☆".repeat(5 - rating)} ` : "";
    await (supabase as any).from("comments").insert({
      video_id: videoId,
      author_name: userName,
      comment_text: starPrefix + text.trim(),
      user_id: user.id,
    });
    setText(""); setRating(0); setPosting(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="px-5 py-4 border-t border-border/50">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
        <Star className="w-4 h-4 text-bb-gold" />
        Reviews ({reviews.length})
      </h3>

      {/* Rating stars */}
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => setRating(s === rating ? 0 : s)}
            className="transition-transform hover:scale-110">
            <Star className={`w-5 h-5 ${s <= rating ? "text-bb-gold fill-current" : "text-muted-foreground"}`} />
          </button>
        ))}
        {rating > 0 && <span className="text-[10px] text-muted-foreground ml-1">{rating}/5</span>}
      </div>

      {/* Post review */}
      <div className="flex gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary">{userName[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && postReview()}
            placeholder="Write a review..."
            className="flex-1 bg-secondary text-foreground text-xs px-3 py-2 rounded-full outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/50" />
          <button onClick={postReview} disabled={!text.trim() || posting}
            className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50 transition-opacity">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {reviews.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-foreground">{c.author_name[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{c.author_name}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-line">{c.comment_text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
