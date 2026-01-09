import { config } from 'dotenv'
config({ path: '.env.local' })
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser';

import postRoutes from './routes/postRoutes'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'

import passport from './config/passport'

const app = express();

//cookie-parser
app.use(cookieParser());

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,  // frontend 
  credentials: true,
}));
app.use(express.json());

app.use(passport.initialize());

// MongoDB Atlas Connection
const MONGO_URI = process.env.MONGO_URI;

// Check if MONGO_URI is defined
if (!MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in your environment variables.");
  process.exit(1); // Exit the process with an error code
}

// Connect to MongoDB
mongoose
  .connect(MONGO_URI) // Deprecated options removed
  .then(() => console.log("MongoDB Atlas connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", userRoutes); 


// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
