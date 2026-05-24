import express from 'express';
import {
  getTemplates,
  createTemplate,
  deleteTemplate,
  toggleFavorite,
  getFavorites,
} from '../controllers/templateController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getTemplates)
  .post(protect, createTemplate);

router.get('/favorites', protect, getFavorites);

router.delete('/:id', protect, deleteTemplate);
router.patch('/:id/favorite', protect, toggleFavorite);

export default router;
