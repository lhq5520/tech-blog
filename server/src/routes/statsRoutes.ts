import express, { Request, Response } from 'express'
import { Post } from '../models/Post'
import { User } from '../models/User'
import { Comment } from '../models/Comment'
import verifyToken from '../middleware/authMiddleware'

const router = express.Router()

// Get statistics (admin only)
router.get("/", verifyToken, async (req:Request, res:Response): Promise<void> => {
  try {
    // Get all statistics in parallel
    const [totalPosts, totalViews, totalUsers, totalComments, topPosts, allPosts] = await Promise.all([
      Post.countDocuments(),
      Post.aggregate([
        { $group: { _id: null, total: { $sum: { $ifNull: ["$views", 0] } } } }
      ]),
      User.countDocuments(),
      Comment.countDocuments(),
      Post.find({}).select('title views').sort({ views: -1 }).limit(5), // Top 5 posts by views
      Post.find({}, { title: 1, subtitle: 1, views: 1, createdAt: 1 }).sort({ views: -1 }) // All posts with stats
    ]);

    const totalViewsCount = totalViews[0]?.total || 0;

    // Get comment counts for all posts
    const postsWithComments = await Promise.all(
      allPosts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ postId: post._id });
        return {
          _id: post._id.toString(),
          title: post.title,
          subtitle: post.subtitle || '',
          views: post.views || 0,
          commentCount,
          createdAt: post.createdAt
        };
      })
    );

    res.json({
      totalPosts,
      totalViews: totalViewsCount,
      totalUsers,
      totalComments,
      topPosts: topPosts.map(post => ({
        _id: post._id.toString(),
        title: post.title || 'Untitled Post',
        views: post.views || 0
      })),
      allPosts: postsWithComments
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;
