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

  console.log('Upload request received:', {
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    cloudinaryConfigured: isCloudinaryConfigured
  });

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
            console.error('Cloudinary upload stream error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful:', {
              public_id: result?.public_id,
              secure_url: result?.secure_url,
              url: result?.url
            });
            resolve(result);
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      bufferToStream(file.buffer).pipe(uploadStream);
    });

    // Return the secure URL from Cloudinary
    const responseUrl = uploadResult.secure_url || uploadResult.url;
    console.log('Returning URL to client:', responseUrl);
    res.json({ url: responseUrl });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    const errorMessage = error?.message || 'Failed to upload image to Cloudinary';
    res.status(500).json({ error: errorMessage });
  }
});

// Helper function to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Cloudinary URL formats:
    // 1. https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    // 2. https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
    // 3. https://res.cloudinary.com/{cloud_name}/image/upload/{transformation}/{public_id}.{format}
    // 4. https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
    
    // Extract everything after /image/upload/
    const uploadMatch = url.match(/\/image\/upload\/(.+)$/);
    if (!uploadMatch || !uploadMatch[1]) {
      return null;
    }

    let path = uploadMatch[1];
    
    // Remove version prefix if present (v1234567890/)
    path = path.replace(/^v\d+\//, '');
    
    // Remove transformation parameters if present (w_500,h_300,c_fill/)
    // Transformations are typically followed by a slash and then the public_id
    // We need to find the last segment which should be the public_id
    const segments = path.split('/');
    
    // The last segment is the public_id (with possible file extension)
    let publicId = segments[segments.length - 1];
    
    // Remove file extension if present
    // Cloudinary public_id should not include the extension
    publicId = publicId.replace(/\.[^.]+$/, '');
    
    // If there are folder segments, include them
    if (segments.length > 1) {
      // Reconstruct with folder path but without the last segment's extension
      const folderPath = segments.slice(0, -1).join('/');
      publicId = folderPath ? `${folderPath}/${publicId}` : publicId;
    }
    
    return publicId || null;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
};

// Delete image endpoint (requires authentication)
router.delete('/image', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'Image URL is required' });
    return;
  }

  // Check if Cloudinary is configured
  if (!isCloudinaryConfigured) {
    res.status(500).json({ 
      error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.' 
    });
    return;
  }

  // Check if URL is from Cloudinary
  if (!url.includes('cloudinary.com')) {
    res.status(400).json({ error: 'Invalid Cloudinary URL' });
    return;
  }

  try {
    // Extract public_id from URL
    const publicId = extractPublicIdFromUrl(url);
    
    if (!publicId) {
      res.status(400).json({ error: 'Could not extract public_id from URL' });
      return;
    }

    console.log('Deleting image from Cloudinary:', { url, publicId });

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image'
    });

    console.log('Cloudinary delete result:', result);

    if (result.result === 'ok' || result.result === 'not found') {
      // 'not found' is also considered success (image might have been already deleted)
      res.json({ 
        success: true, 
        message: 'Image deleted successfully',
        result: result.result 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to delete image from Cloudinary',
        details: result.result 
      });
    }
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    const errorMessage = error?.message || 'Failed to delete image from Cloudinary';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
