import express, { Request, Response } from 'express'
import { Post } from '../models/Post'
import verifyToken from '../middleware/authMiddleware'

const router = express.Router()

// Create a new post (user-specific)
router.post("/", verifyToken, async (req:Request, res:Response): Promise<void> => {
  const { title, subtitle, content, coverImage, tags } = req.body;

  if (!title || !subtitle || !content) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  try {
    // Process tags: ensure it's an array and trim each tag
    let processedTags: string[] = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags
          .map((tag: any) => String(tag).trim())
          .filter((tag: string) => tag.length > 0);
      } else if (typeof tags === 'string') {
        // Support comma-separated string
        processedTags = tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);
      }
    }

    const newPost = new Post({
      title,
      subtitle,
      content,
      coverImage: coverImage || undefined,
      tags: processedTags,
      userId: req.user!.id, // Link to the authenticated user
    });
    await newPost.save();
    
    // Return a simplified response without full content to avoid large response size issues
    // The client can fetch the full post details separately if needed
    const responsePost = {
      _id: newPost._id,
      title: newPost.title,
      subtitle: newPost.subtitle,
      coverImage: newPost.coverImage,
      tags: newPost.tags,
      userId: newPost.userId,
      views: newPost.views,
      createdAt: newPost.createdAt,
    };
    res.status(201).json(responsePost);
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

// Get all posts for everyone (with optional search and tag filter)
router.get("/", async (req:Request, res:Response): Promise<void> => {
  try {
    const searchQuery = req.query.search as string | undefined;
    const tagFilter = req.query.tag as string | undefined;
    
    // Build query object
    let query: any = {};
    
    // If search query exists, search in title, subtitle, and content
    if (searchQuery && searchQuery.trim()) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { subtitle: { $regex: searchQuery, $options: "i" } },
        { content: { $regex: searchQuery, $options: "i" } },
      ];
    }
    
    // If tag filter exists, filter by tag
    if (tagFilter && tagFilter.trim()) {
      query.tags = { $in: [tagFilter.trim()] };
    }
    
    // Exclude full content from list view to reduce response size
    // This prevents response size issues with long blog posts
    const posts = await Post.find(query)
      .select('-content') // Exclude full content
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Get all posts for everyone (with pagination, search, sorting, and tag filter)
router.get("/pagelimit", async (req:Request, res:Response): Promise<void> => {
  try {
    // 1. Get pagination parameters (default: page 1, 5 posts per page)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const searchQuery = req.query.search as string | undefined;
    const tagFilter = req.query.tag as string | undefined;
    const sortBy = req.query.sortBy as string || "date"; // "date" or "title"
    const sortOrder = req.query.sortOrder as string || "desc"; // "asc" or "desc"
    
    // 2. Calculate the number of posts to skip
    const skip = (page - 1) * limit;

    // 3. Build search query
    let query: any = {};
    if (searchQuery && searchQuery.trim()) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { subtitle: { $regex: searchQuery, $options: "i" } },
        { content: { $regex: searchQuery, $options: "i" } },
      ];
    }
    
    // Add tag filter if provided
    if (tagFilter && tagFilter.trim()) {
      query.tags = { $in: [tagFilter.trim()] };
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
    // Exclude full content from list view to reduce response size
    const [posts, total] = await Promise.all([
      Post.find(query)
        .select('-content') // Exclude full content to reduce response size
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
    // Use findByIdAndUpdate with $inc to atomically increment views
    // This ensures views are only incremented once even if called multiple times
    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true } // Return updated document
    );
    
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
  const { title, subtitle, content, coverImage, tags } = req.body;
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

    // Process tags: ensure it's an array and trim each tag
    let processedTags: string[] = [];
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        processedTags = tags
          .map((tag: any) => String(tag).trim())
          .filter((tag: string) => tag.length > 0);
      } else if (typeof tags === 'string') {
        // Support comma-separated string
        processedTags = tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);
      }
    }

    // Update the post
    const updateData: any = { title, subtitle, content };
    if (coverImage !== undefined) {
      updateData.coverImage = coverImage || undefined;
    }
    if (tags !== undefined) {
      updateData.tags = processedTags;
    }
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, userId: userId },
      updateData,
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

// Get all unique tags
router.get("/tags/all", async (req:Request, res:Response): Promise<void> => {
  try {
    const posts = await Post.find({}, { tags: 1 });
    const allTags = new Set<string>();
    
    posts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          if (tag && tag.trim()) {
            allTags.add(tag.trim());
          }
        });
      }
    });
    
    const sortedTags = Array.from(allTags).sort();
    res.json({ tags: sortedTags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
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
