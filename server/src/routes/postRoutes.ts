import express, { Request, Response } from 'express'
import { Post } from '../models/Post'
import verifyToken from '../middleware/authMiddleware'

const router = express.Router()

// Create a new post (user-specific)
router.post("/", verifyToken, async (req:Request, res:Response): Promise<void> => {
  const { title, subtitle, content } = req.body;

  if (!title || !subtitle || !content) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  try {
    const newPost = new Post({
      title,
      subtitle,
      content,
      userId: req.user!.id, // Link to the authenticated user
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error: any) {
    console.error("Error creating post:", error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      res.status(400).json({ 
        error: "Validation error",
        details: Object.values(error.errors).map((e: any) => e.message).join(', ')
      });
      return;
    }

    const errorMessage = error?.message || "An unexpected error occurred while creating the post";
    res.status(500).json({ 
      error: "Failed to create post",
      details: errorMessage
    });
  }
});

// Get all posts for everyone (with optional search)
router.get("/", async (req:Request, res:Response): Promise<void> => {
  try {
    const searchQuery = req.query.search as string | undefined;
    
    // Build query object
    let query: any = {};
    
    // If search query exists, search in title, subtitle, and content
    if (searchQuery && searchQuery.trim()) {
      query = {
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { subtitle: { $regex: searchQuery, $options: "i" } },
          { content: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }
    
    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Get all posts for everyone (with pagination, search, and sorting)
router.get("/pagelimit", async (req:Request, res:Response): Promise<void> => {
  try {
    // 1. Get pagination parameters (default: page 1, 5 posts per page)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const searchQuery = req.query.search as string | undefined;
    const sortBy = req.query.sortBy as string || "date"; // "date" or "title"
    const sortOrder = req.query.sortOrder as string || "desc"; // "asc" or "desc"
    
    // 2. Calculate the number of posts to skip
    const skip = (page - 1) * limit;

    // 3. Build search query
    let query: any = {};
    if (searchQuery && searchQuery.trim()) {
      query = {
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { subtitle: { $regex: searchQuery, $options: "i" } },
          { content: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    // 4. Build sort object
    let sortObject: any = {};
    if (sortBy === "date") {
      sortObject.createdAt = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "title") {
      sortObject.title = sortOrder === "asc" ? 1 : -1;
    } else {
      // Default to date descending
      sortObject.createdAt = -1;
    }

    // 5. Parallel queries: fetch posts list + fetch total post count
    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(sortObject)
        .skip(skip)              // Skip previous posts
        .limit(limit),           // Fetch only 'limit' posts
      Post.countDocuments(query) // Count total posts matching search
    ]);

    // 6. Return object with pagination information
    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});


// Get a single blog post by its _id
router.get("/:id", async (req:Request, res:Response): Promise<void> => {
  const { id } = req.params; // Extract blog ID from the route parameter

  try {
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(post);
  } catch (error) {
    console.error("Error fetching the post:", error);
    res.status(500).json({ error: "Failed to fetch the post" });
  }
});


// Update a post (PUT /posts/:id)
router.put("/:id", verifyToken, async (req:Request, res:Response): Promise<void> => {
  const { title, subtitle, content } = req.body;
  const postId = req.params.id;
  const userId = req.user!.id;

  if (!title || !subtitle || !content) {
    res.status(400).json({ 
      error: "All fields are required.",
      details: "Please make sure title, subtitle, and content are all filled in."
    });
    return;
  }

  try {
    // First check if post exists
    const existingPost = await Post.findById(postId);
    
    if (!existingPost) {
      res.status(404).json({ 
        error: "Post not found",
        details: `The post with ID "${postId}" does not exist in the database. It may have been deleted or the ID is incorrect.`
      });
      return;
    }

    // Check if user owns the post
    if (existingPost.userId.toString() !== userId.toString()) {
      res.status(403).json({ 
        error: "Permission denied",
        details: `You don't have permission to edit this post. This post belongs to a different user.`
      });
      return;
    }

    // Update the post
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, userId: userId },
      { title, subtitle, content },
      { new: true } // Return updated document
    );

    if (!updatedPost) {
      res.status(500).json({ 
        error: "Failed to update post",
        details: "The post exists but the update operation failed. Please try again."
      });
      return;
    }

    res.json(updatedPost);
  } catch (error: any) {
    console.error("Error updating post:", error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      res.status(400).json({ 
        error: "Validation error",
        details: Object.values(error.errors).map((e: any) => e.message).join(', ')
      });
      return;
    }

    // Handle MongoDB cast errors (invalid ID format)
    if (error.name === 'CastError') {
      res.status(400).json({ 
        error: "Invalid post ID",
        details: `The post ID "${postId}" is not in a valid format.`
      });
      return;
    }

    const errorMessage = error?.message || "An unexpected error occurred while updating the post";
    res.status(500).json({ 
      error: "Failed to update post",
      details: errorMessage
    });
  }
});


router.delete("/:id", verifyToken, async (req:Request, res:Response): Promise<void> => {
  const postId = req.params.id;
  const userId = req.user!.id;

  try {
    // First check if post exists
    const existingPost = await Post.findById(postId);
    
    if (!existingPost) {
      res.status(404).json({ 
        error: "Post not found",
        details: `The post with ID "${postId}" does not exist in the database. It may have already been deleted.`
      });
      return;
    }

    // Check if user owns the post
    if (existingPost.userId.toString() !== userId.toString()) {
      res.status(403).json({ 
        error: "Permission denied",
        details: `You don't have permission to delete this post. This post belongs to a different user.`
      });
      return;
    }

    const deletedPost = await Post.findOneAndDelete({
      _id: postId,
      userId: userId,
    });

    if (!deletedPost) {
      res.status(500).json({ 
        error: "Failed to delete post",
        details: "The post exists but the deletion operation failed. Please try again."
      });
      return;
    }

    // Return 204 No Content for successful deletion
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting post:", error);
    
    // Handle MongoDB cast errors (invalid ID format)
    if (error.name === 'CastError') {
      res.status(400).json({ 
        error: "Invalid post ID",
        details: `The post ID "${postId}" is not in a valid format.`
      });
      return;
    }

    const errorMessage = error?.message || "An unexpected error occurred while deleting the post";
    res.status(500).json({ 
      error: "Failed to delete post",
      details: errorMessage
    });
  }
});

// // Search posts by title or content
// router.get("/search", verifyToken, async (req, res) => {
//   const { q } = req.query; // Extract the search query from the URL

//   if (!q) {
//     return res.status(400).json({ error: "Search query is required." });
//   }

//   try {
//     const posts = await Post.find({
//       userId: req.user.id, // Ensure the user owns the posts
//       $or: [
//         { title: { $regex: q, $options: "i" } }, // Case-insensitive match for title
//         { content: { $regex: q, $options: "i" } }, // Case-insensitive match for content
//       ],
//     });

//     res.json(posts);
//   } catch (error) {
//     console.error("Error searching posts:", error);
//     res.status(500).json({ error: "Failed to search posts." });
//   }
// });

export default router;
