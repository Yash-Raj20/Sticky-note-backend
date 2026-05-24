import express from 'express';
import { registerUser, loginUser, updateProfile, forgotPassword, resetPassword } from '../controllers/authController';

const router = express.Router();

import { protect } from '../middleware/authMiddleware';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateProfile);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

export default router;
