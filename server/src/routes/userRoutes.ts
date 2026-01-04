import express, {Request, Response} from 'express'
import { User } from '../models/User'
import verifyToken from '../middleware/authMiddleware'

const router = express.Router()

// GET /profile - Fetch user profile
router.get("/", verifyToken, async (req:Request, res:Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select("-password"); // Exclude password
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user); // Send the user profile

  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
