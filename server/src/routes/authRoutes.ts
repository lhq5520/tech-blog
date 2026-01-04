import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { Types } from 'mongoose'

const router = express.Router()

// Helper function to generate JWT
const generateToken = (userId: Types.ObjectId):string => {
  return jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET!, 
    { expiresIn: '2d' }
  );
};

// Register route
router.post("/register", async (req: Request, res:Response):Promise<void> => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (error:any) {
    res.status(400).json({ error: error.message});
  }
});


// Login route
router.post("/login", async (req:Request, res:Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = generateToken(user._id);

    res.status(200).json({ token, user: { id: user._id, email: user.email } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
