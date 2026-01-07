import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { Types } from 'mongoose'
import verifyToken from '../middleware/authMiddleware'
import passport from 'passport';

const router = express.Router()

// Helper function to generate JWT
const generateToken = (userId: Types.ObjectId):string => {
  return jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET!, 
    { expiresIn: '2d' }
  );
};

// Register route
/*
router.post("/register", async (req: Request, res:Response):Promise<void> => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: { id: user._id, email: user.email } });
  } catch (error:any) {
    res.status(400).json({ error: error.message});
  }
});
*/

// Login route
router.post("/login", async (req:Request, res:Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000,  // 2days
    });

    res.status(200).json({ user: { id: user._id, email: user.email } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

//log out
router.post("/logout", (_req:Request, res:Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  
  res.json({ message: 'ok' });
});


//auth status check
router.get("/check", verifyToken, async (req:Request, res:Response): Promise<void> => {
  res.json({ user: req.user });
});


//redirect user to google Oauth page
router.get("/google", passport.authenticate('google', {
    scope: ['profile', 'email']
}));


// Google OAuth callback handler
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=unauthorized` }),
  (req: Request, res: Response) => {
    // Get authenticated user from Passport
    const user = req.user as any;
    
    // Generate JWT token
    const token = generateToken(user._id);

    // Set token cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL!);
  }
);


export default router;
