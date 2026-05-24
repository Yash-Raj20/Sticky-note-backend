import { Request, Response } from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

interface AuthRequest extends Request {
  user?: any;
}

// Lazily configure Cloudinary so dotenv has already run
function getCloudinary() {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary.v2;
}

// Cloudinary multer storage
const storage = new CloudinaryStorage({
  cloudinary: getCloudinary(),
  params: async (_req, file) => ({
    folder: 'stickynotes-attachments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
    resource_type: file.mimetype.startsWith('image/') ? 'image' : 'raw',
    use_filename: true,
    unique_filename: true,
  }),
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

/** POST /api/upload — Upload a file and return its URL */
export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file as Express.Multer.File & { path: string; filename: string };
    if (!file) {
      res.status(400).json({ success: false, statusCode: 400, message: 'No file provided' });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'File uploaded successfully',
      data: {
        url: file.path,       // Cloudinary HTTPS URL
        name: file.originalname,
        type: file.mimetype.startsWith('image/') ? 'image' : 'file',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};
