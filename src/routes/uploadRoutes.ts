import express from 'express';
import { uploadFile, upload } from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadFile);

export default router;
