import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchComments, createComment, deleteComment } from "../api/comments";
import { type Comment } from "../types";
import { showSuccess, showError } from "../utils/toast";
import "../styles/commentSection.css";

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps): React.ReactElement => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentContent, setCommentContent] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [authorEmail, setAuthorEmail] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Load comments when component mounts or postId changes
  useEffect(() => {
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

    loadComments();
  }, [postId]);

  // Handle comment submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!commentContent.trim()) {
      showError("Comment cannot be empty", "Please write something before submitting.");
      return;
    }

    // For anonymous users, require at least a name
    if (!user && !authorName.trim()) {
      showError("Name required", "Please provide your name to post a comment.");
      return;
    }

    // Validate content length
    if (commentContent.trim().length > 2000) {
      showError("Comment too long", "Comments must be 2000 characters or less.");
      return;
    }

    try {
      setSubmitting(true);
      const newComment = await createComment(
        postId, 
        commentContent.trim(),
        !user ? authorName.trim() : undefined,
        !user ? authorEmail.trim() || undefined : undefined
      );
      setComments([newComment, ...comments]); // Add new comment at the beginning
      setCommentContent(""); // Clear the form
      setAuthorName(""); // Clear anonymous user fields
      setAuthorEmail("");
      showSuccess("Comment posted successfully!");
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

  // Handle comment deletion
  const handleDelete = async (commentId: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteComment(commentId);
      setComments(comments.filter((comment) => comment._id !== commentId));
      showSuccess("Comment deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      showError(
        error?.message || "Failed to delete comment",
        error?.details || "You can only delete your own comments, or comments posted from your IP address within the last 5 minutes."
      );
    }
  };

  // Get author name from comment
  const getAuthorName = (comment: Comment): string => {
    // If user is logged in and owns the comment, show email
    if (comment.userId) {
      if (typeof comment.userId === "object" && comment.userId !== null) {
        return comment.userId.email;
      }
      // If user owns the comment, show their email
      if (user && comment.userId === user.id) {
        return user.email || "You";
      }
      return "User";
    }
    // For anonymous comments, show authorName or fallback
    return comment.authorName || "Anonymous";
  };

  // Check if current user can delete the comment
  // Users can delete their own comments, or comments posted from their IP within 5 minutes
  const canDeleteComment = (comment: Comment): boolean => {
    // If user is logged in and owns the comment
    if (user && comment.userId) {
      const userId = typeof comment.userId === "object" && comment.userId !== null
        ? comment.userId._id
        : comment.userId;
      return userId === user.id;
    }
    // For anonymous comments, we'll show delete button but backend will verify IP and time
    // This allows users to try deleting comments they posted (within 5 minutes)
    return true; // Backend will handle the actual permission check
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">Comments ({comments.length})</h3>

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
            <div key={comment._id} className="comment-item">
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
              <div className="comment-content">{comment.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
