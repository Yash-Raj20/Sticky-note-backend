import express from 'express';
import { brainstorm, categorize, summarize, editNote, autoColor, autoConnect, generateActionPlan } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/brainstorm', protect, brainstorm);
router.post('/categorize', protect, categorize);
router.post('/summarize', protect, summarize);
router.post('/edit-note', protect, editNote);
router.post('/auto-color', protect, autoColor);
router.post('/auto-connect', protect, autoConnect);
router.post('/action-plan', protect, generateActionPlan);

export default router;
