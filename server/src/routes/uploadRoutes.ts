import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import verifyToken from '../middleware/authMiddleware';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';
import { Readable } from 'stream';

const router = express.Router();

// Configure multer to use memory storage (for Cloudinary)
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (Cloudinary supports larger files)
  },
  fileFilter: fileFilter
});

// Helper function to convert buffer to stream
const bufferToStream = (buffer: Buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

// Upload image endpoint (requires authentication)
router.post('/image', verifyToken, upload.single('upload'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  // Check if Cloudinary is configured
  if (!isCloudinaryConfigured) {
    res.status(500).json({ 
      error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.' 
    });
    return;
  }

  const file = req.file; // Store reference to avoid undefined check issues

  try {
    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'blog-images', // Optional: organize images in a folder
          resource_type: 'image',
          transformation: [
            { quality: 'auto' }, // Auto optimize quality
            { fetch_format: 'auto' }, // Auto format (webp when supported)
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      bufferToStream(file.buffer).pipe(uploadStream);
    });

    // Return the secure URL from Cloudinary
    res.json({ url: uploadResult.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    const errorMessage = error?.message || 'Failed to upload image to Cloudinary';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
