import express from 'express';
import { registerUser, loginUser, updateProfile } from '../controllers/authController';

const router = express.Router();

import { protect } from '../middleware/authMiddleware';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateProfile);

export default router;
