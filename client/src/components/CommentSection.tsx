import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchComments, createComment, deleteComment } from "../api/comments";
import { type Comment } from "../types";
import { showSuccess, showError } from "../utils/toast";
import "../styles/commentSection.css";

interface CommentSectionProps {
  postId: string;
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onCommentAdded: () => void;
  onCommentDeleted: (commentId: string) => void;
  depth?: number;
}

const CommentItem = ({ comment, postId, onCommentAdded, onCommentDeleted, depth = 0 }: CommentItemProps) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthorName, setReplyAuthorName] = useState("");
  const [replyAuthorEmail, setReplyAuthorEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!replyContent.trim()) {
      showError("Reply cannot be empty", "Please write something before submitting.");
      return;
    }

    if (!user && !replyAuthorName.trim()) {
      showError("Name required", "Please provide your name to post a reply.");
      return;
    }

    if (replyContent.trim().length > 2000) {
      showError("Reply too long", "Replies must be 2000 characters or less.");
      return;
    }

    try {
      setSubmitting(true);
      await createComment(
        postId,
        replyContent.trim(),
        !user ? replyAuthorName.trim() : undefined,
        !user ? replyAuthorEmail.trim() || undefined : undefined,
        comment._id
      );
      setReplyContent("");
      setReplyAuthorName("");
      setReplyAuthorEmail("");
      setIsReplying(false);
      showSuccess("Reply posted successfully!");
      onCommentAdded();
    } catch (error: any) {
      console.error("Error creating reply:", error);
      showError(
        error?.message || "Failed to post reply",
        error?.details || "Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteComment(commentId);
      onCommentDeleted(commentId);
      showSuccess("Comment deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      showError(
        error?.message || "Failed to delete comment",
        error?.details || "You can only delete your own comments, or comments posted from your IP address within the last 5 minutes."
      );
    }
  };

  const getAuthorName = (comment: Comment): string => {
    if (comment.userId) {
      if (typeof comment.userId === "object" && comment.userId !== null) {
        return comment.userId.email;
      }
      if (user && comment.userId === user.id) {
        return user.email || "You";
      }
      return "User";
    }
    return comment.authorName || "Anonymous";
  };

  const canDeleteComment = (comment: Comment): boolean => {
    if (user && comment.userId) {
      const userId = typeof comment.userId === "object" && comment.userId !== null
        ? comment.userId._id
        : comment.userId;
      return userId === user.id;
    }
    return true;
  };

  return (
    <div 
      className={`comment-item ${depth > 0 ? 'comment-reply' : ''}`} 
      data-depth={depth}
    >
      <div className="comment-header">
        <div className="comment-author">
          <strong>{getAuthorName(comment)}</strong>
          {comment.authorEmail && (
            <span className="comment-author-email">{comment.authorEmail}</span>
          )}
          <span className="comment-date">
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }).format(new Date(comment.createdAt))}
          </span>
        </div>
        <div className="comment-actions">
          <button
            className="comment-reply-btn"
            onClick={() => setIsReplying(!isReplying)}
            title="Reply to comment"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="comment-reply-icon">
              <path d="M6.78 1.22a.75.75 0 0 0-1.06 0L2.22 4.72a.75.75 0 0 0 0 1.06l3.5 3.5a.75.75 0 0 0 1.06-1.06L4.56 6.5h7.19a3.25 3.25 0 0 1 0 6.5H8a.75.75 0 0 0 0 1.5h3.75a4.75 4.75 0 0 0 0-9.5H4.56l2.16-2.16a.75.75 0 0 0 0-1.06z"/>
            </svg>
            <span>Reply</span>
          </button>
          {canDeleteComment(comment) && (
            <button
              className="comment-delete-btn"
              onClick={() => handleDelete(comment._id)}
              title="Delete comment"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="comment-content">{comment.content}</div>

      {/* Reply Form */}
      {isReplying && (
        <form onSubmit={handleReply} className="comment-reply-form">
          {!user && (
            <div className="comment-anonymous-fields">
              <input
                type="text"
                className="comment-input comment-name-input"
                placeholder="Your name *"
                value={replyAuthorName}
                onChange={(e) => setReplyAuthorName(e.target.value)}
                disabled={submitting}
                required
              />
              <input
                type="email"
                className="comment-input comment-email-input"
                placeholder="Your email (optional)"
                value={replyAuthorEmail}
                onChange={(e) => setReplyAuthorEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
          )}
          <textarea
            className="comment-input"
            placeholder={`Reply to ${getAuthorName(comment)}...`}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
            disabled={submitting}
            maxLength={2000}
          />
          <div className="comment-form-footer">
            <span className="comment-char-count">
              {replyContent.length}/2000
            </span>
            <div className="comment-form-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent("");
                  setReplyAuthorName("");
                  setReplyAuthorEmail("");
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting || !replyContent.trim() || (!user && !replyAuthorName.trim())}
              >
                {submitting ? "Posting..." : "Post Reply"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              onCommentAdded={onCommentAdded}
              onCommentDeleted={onCommentDeleted}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection = ({ postId }: CommentSectionProps): React.ReactElement => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentContent, setCommentContent] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [authorEmail, setAuthorEmail] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await fetchComments(postId);
      setComments(data);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      showError("Failed to load comments", error?.details || "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Load comments when component mounts or postId changes
  useEffect(() => {
    loadComments();
  }, [postId]);

  // Handle comment submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!commentContent.trim()) {
      showError("Comment cannot be empty", "Please write something before submitting.");
      return;
    }

    if (!user && !authorName.trim()) {
      showError("Name required", "Please provide your name to post a comment.");
      return;
    }

    if (commentContent.trim().length > 2000) {
      showError("Comment too long", "Comments must be 2000 characters or less.");
      return;
    }

    try {
      setSubmitting(true);
      await createComment(
        postId, 
        commentContent.trim(),
        !user ? authorName.trim() : undefined,
        !user ? authorEmail.trim() || undefined : undefined
      );
      setCommentContent("");
      setAuthorName("");
      setAuthorEmail("");
      showSuccess("Comment posted successfully!");
      loadComments(); // Reload comments to get the nested structure
    } catch (error: any) {
      console.error("Error creating comment:", error);
      showError(
        error?.message || "Failed to post comment",
        error?.details || "Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    // Recursively remove comment and its replies
    const removeComment = (commentList: Comment[]): Comment[] => {
      return commentList
        .filter(comment => comment._id !== commentId)
        .map(comment => ({
          ...comment,
          replies: comment.replies ? removeComment(comment.replies) : undefined
        }));
    };
    setComments(removeComment(comments));
  };

  // Count total comments including replies
  const countTotalComments = (commentList: Comment[]): number => {
    return commentList.reduce((count, comment) => {
      return count + 1 + (comment.replies ? countTotalComments(comment.replies) : 0);
    }, 0);
  };

  const totalComments = countTotalComments(comments);

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">Comments ({totalComments})</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        {!user && (
          <div className="comment-anonymous-fields">
            <input
              type="text"
              className="comment-input comment-name-input"
              placeholder="Your name *"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              disabled={submitting}
              required
            />
            <input
              type="email"
              className="comment-input comment-email-input"
              placeholder="Your email (optional)"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              disabled={submitting}
            />
          </div>
        )}
        <textarea
          className="comment-input"
          placeholder="Write your comment here..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          rows={4}
          disabled={submitting}
          maxLength={2000}
        />
        <div className="comment-form-footer">
          <span className="comment-char-count">
            {commentContent.length}/2000
          </span>
          <button
            type="submit"
            className="btn btn-primary comment-submit-btn"
            disabled={submitting || !commentContent.trim() || (!user && !authorName.trim())}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="comment-loading">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="comment-empty">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              onCommentAdded={loadComments}
              onCommentDeleted={handleCommentDeleted}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
