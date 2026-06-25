import { useState, useEffect } from "react";
import { MessageCircle, ThumbsUp, Heart, Pin, Loader2, ChevronDown } from "lucide-react";
import { getComments, type PipedComment } from "@/lib/piped";

interface CommentsSectionProps {
  videoId: string;
}

const CommentItem = ({ comment }: { comment: PipedComment }) => (
  <div className="flex gap-2.5 py-3 border-b border-border/50 last:border-0">
    <img
      src={comment.thumbnail}
      alt={comment.author}
      className="w-7 h-7 rounded-full bg-muted flex-shrink-0 object-cover"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        {comment.pinned && (
          <Pin className="w-3 h-3 text-primary flex-shrink-0" />
        )}
        <span className="text-xs font-medium text-foreground truncate">
          {comment.author}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {comment.commentedTime}
        </span>
      </div>
      <p className="text-xs text-foreground/90 mt-0.5 leading-relaxed whitespace-pre-line break-words">
        {comment.commentText}
      </p>
      <div className="flex items-center gap-3 mt-1.5">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <ThumbsUp className="w-3 h-3" />
          {comment.likeCount > 0 ? comment.likeCount.toLocaleString() : ""}
        </span>
        {comment.hearted && (
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
        )}
      </div>
    </div>
  </div>
);

const CommentsSection = ({ videoId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<PipedComment[]>([]);
  const [nextpage, setNextpage] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setComments([]);
    setNextpage(undefined);
    setLoading(true);
    setDisabled(false);

    getComments(videoId).then((res) => {
      setComments(res.comments);
      setNextpage(res.nextpage ?? undefined);
      setDisabled(res.disabled);
      setLoading(false);
    });
  }, [videoId]);

  const loadMore = async () => {
    if (!nextpage || loadingMore) return;
    setLoadingMore(true);
    const res = await getComments(videoId, nextpage);
    setComments((prev) => [...prev, ...res.comments]);
    setNextpage(res.nextpage ?? undefined);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading comments...</span>
        </div>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="px-4 py-4">
        <p className="text-sm text-muted-foreground">Comments are disabled for this video.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
        <MessageCircle className="w-4 h-4 text-primary" />
        Comments
        {comments.length > 0 && (
          <span className="text-xs font-normal text-muted-foreground">
            ({comments.length}{nextpage ? "+" : ""})
          </span>
        )}
      </h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No comments yet.</p>
      ) : (
        <div>
          {comments.map((c, i) => (
            <CommentItem key={`${c.commentorUrl}-${i}`} comment={c} />
          ))}

          {nextpage && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-primary font-medium hover:text-primary/80 transition-colors"
            >
              {loadingMore ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Load more comments
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
