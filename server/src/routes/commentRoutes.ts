import express, { Request, Response } from 'express'
import { Comment } from '../models/Comment'
import { Post } from '../models/Post'
import { commentLimiter, deleteCommentLimiter } from '../middleware/rateLimiter'

const router = express.Router()

// Helper function to get client IP address
const getClientIp = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         (req.headers['x-real-ip'] as string) || 
         req.socket.remoteAddress || 
         'unknown';
};

// Create a new comment (no authentication required, but rate limited)
router.post("/", commentLimiter, async (req: Request, res: Response): Promise<void> => {
  const { content, postId, authorName, authorEmail } = req.body;

  if (!content || !postId) {
    res.status(400).json({ 
      error: "Content and postId are required.",
      details: "Please provide both comment content and the post ID."
    });
    return;
  }

  if (!content.trim()) {
    res.status(400).json({ 
      error: "Comment content cannot be empty.",
      details: "Please provide a non-empty comment."
    });
    return;
  }

  // Validate content length
  if (content.trim().length > 2000) {
    res.status(400).json({ 
      error: "Comment too long",
      details: "Comments must be 2000 characters or less."
    });
    return;
  }

  try {
    // Verify that the post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ 
        error: "Post not found",
        details: `The post with ID "${postId}" does not exist.`
      });
      return;
    }

    const ipAddress = getClientIp(req);
    const commentData: any = {
      content: content.trim(),
      postId,
      ipAddress,
    };

    // If user is authenticated, use userId; otherwise use authorName/authorEmail
    if (req.user) {
      commentData.userId = req.user.id;
    } else {
      // For anonymous users, require at least a name
      if (!authorName || !authorName.trim()) {
        res.status(400).json({ 
          error: "Author name required",
          details: "Please provide your name to post a comment."
        });
        return;
      }
      commentData.authorName = authorName.trim();
      if (authorEmail && authorEmail.trim()) {
        commentData.authorEmail = authorEmail.trim();
      }
    }

    const newComment = new Comment(commentData);
    await newComment.save();
    
    // Populate user information if userId exists
    if (newComment.userId) {
      await newComment.populate('userId', 'email');
    }
    
    res.status(201).json(newComment);
  } catch (error: any) {
    console.error("Error creating comment:", error);
    
    if (error.name === 'ValidationError') {
      res.status(400).json({ 
        error: "Validation error",
        details: Object.values(error.errors).map((e: any) => e.message).join(', ')
      });
      return;
    }

    const errorMessage = error?.message || "An unexpected error occurred while creating the comment";
    res.status(500).json({ 
      error: "Failed to create comment",
      details: errorMessage
    });
  }
});

// Get all comments for a specific post
router.get("/post/:postId", async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

  try {
    // Verify that the post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ 
        error: "Post not found",
        details: `The post with ID "${postId}" does not exist.`
      });
      return;
    }

    const comments = await Comment.find({ postId })
      .populate('userId', 'email')
      .sort({ createdAt: -1 }); // Most recent first
    
    res.json(comments);
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    
    if (error.name === 'CastError') {
      res.status(400).json({ 
        error: "Invalid post ID",
        details: `The post ID "${postId}" is not in a valid format.`
      });
      return;
    }

    res.status(500).json({ 
      error: "Failed to fetch comments",
      details: error?.message || "An unexpected error occurred."
    });
  }
});

// Delete a comment (can be deleted by owner or by IP within 5 minutes)
router.delete("/:id", deleteCommentLimiter, async (req: Request, res: Response): Promise<void> => {
  const commentId = req.params.id;
  const ipAddress = getClientIp(req);

  try {
    // First check if comment exists
    const existingComment = await Comment.findById(commentId);
    
    if (!existingComment) {
      res.status(404).json({ 
        error: "Comment not found",
        details: `The comment with ID "${commentId}" does not exist. It may have already been deleted.`
      });
      return;
    }

    let canDelete = false;

    // Check if user is authenticated and owns the comment
    if (req.user && existingComment.userId) {
      if (existingComment.userId.toString() === req.user.id.toString()) {
        canDelete = true;
      }
    }

    // If not authenticated user, check if IP matches and comment is less than 5 minutes old
    if (!canDelete) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (existingComment.ipAddress === ipAddress && 
          new Date(existingComment.createdAt) > fiveMinutesAgo) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      res.status(403).json({ 
        error: "Permission denied",
        details: `You don't have permission to delete this comment. You can only delete your own comments, or comments posted from your IP address within the last 5 minutes.`
      });
      return;
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      res.status(500).json({ 
        error: "Failed to delete comment",
        details: "The comment exists but the deletion operation failed. Please try again."
      });
      return;
    }

    // Return 204 No Content for successful deletion
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    
    if (error.name === 'CastError') {
      res.status(400).json({ 
        error: "Invalid comment ID",
        details: `The comment ID "${commentId}" is not in a valid format.`
      });
      return;
    }

    const errorMessage = error?.message || "An unexpected error occurred while deleting the comment";
    res.status(500).json({ 
      error: "Failed to delete comment",
      details: errorMessage
    });
  }
});

export default router;
