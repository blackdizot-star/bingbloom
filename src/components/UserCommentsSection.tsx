import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserComment {
  id: string;
  video_id: string;
  author_name: string;
  comment_text: string;
  created_at: string;
}

const UserCommentsSection = ({ videoId }: { videoId: string }) => {
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const userName = (() => {
    try {
      const p = JSON.parse(localStorage.getItem("user_profile") || "{}");
      return p.firstName ? `${p.firstName} ${p.lastName || ""}`.trim() : "Anonymous";
    } catch { return "Anonymous"; }
  })();

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false })
      .limit(50);
    setComments((data as UserComment[]) || []);
    setLoading(false);
  }, [videoId]);

  useEffect(() => {
    fetchComments();
    const channel = supabase
      .channel(`comments-${videoId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "comments",
        filter: `video_id=eq.${videoId}`,
      }, (payload: any) => {
        setComments((prev) => [payload.new as UserComment, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [videoId, fetchComments]);

  const postComment = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please sign in to post a comment.");
      setPosting(false);
      return;
    }
    await supabase.from("comments").insert({
      video_id: videoId,
      author_name: userName,
      comment_text: text.trim(),
      user_id: user.id,
    });
    setText("");
    setPosting(false);
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
    <div className="px-4 py-3 border-t border-border">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
        <MessageCircle className="w-4 h-4 text-primary" />
        Comments ({comments.length})
      </h3>

      {/* Post comment */}
      <div className="flex gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary">{userName[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && postComment()}
            placeholder="Add a comment..."
            className="flex-1 bg-accent text-foreground text-xs px-3 py-2 rounded-full outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={postComment}
            disabled={!text.trim() || posting}
            className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-foreground">{c.author_name[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{c.author_name}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-xs text-foreground/90 mt-0.5 whitespace-pre-line">{c.comment_text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCommentsSection;
