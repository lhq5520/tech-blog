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
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Get all posts for the logged-in user
router.get("/", verifyToken, async (req:Request, res:Response): Promise<void> => {
  try {
    const posts = await Post.find({ userId: req.user!.id }); // Fetch posts for the user
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});


// Get a single blog post by its _id
router.get("/:id", verifyToken, async (req:Request, res:Response): Promise<void> => {
  const { id } = req.params; // Extract blog ID from the route parameter

  try {
    const post = await Post.findOne({ _id: id, userId: req.user!.id }); // Ensure the post belongs to the user
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

  if (!title || !subtitle || !content) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id }, // Ensure user owns the post
      { title, subtitle, content },
      { new: true } // Return updated document
    );

    if (!updatedPost) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post." });
  }
});


router.delete("/:id", verifyToken, async (req:Request, res:Response): Promise<void> => {
  try {
    const deletedPost = await Post.findOneAndDelete({
      _id: req.params.id, // The ID from the request URL
      userId: req.user!.id, // Ensure the user owns the post
    });

    if (!deletedPost) {
      // Return 404 if the post was not found
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // Return 204 No Content for successful deletion
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post." });
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
