import express from 'express';
import { getBoards, createBoard, updateBoard, deleteBoard, shareBoardWithUser } from '../controllers/boardController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getBoards).post(protect, createBoard);
router.route('/:id').patch(protect, updateBoard).delete(protect, deleteBoard);
router.route('/:id/share').post(protect, shareBoardWithUser);

export default router;
