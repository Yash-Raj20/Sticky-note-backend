import express from 'express';
import { 
  getNotes, getArchivedNotes, getTrashedNotes, getSharedNotes, searchNotes, getTags, 
  createNote, updateNote, deleteNote, shareNote, getSharedNote, shareNoteWithUser,
  addConnection, removeConnection
} from '../controllers/noteController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getNotes).post(protect, createNote);

// Specific GET routes must come before /:id routes
router.get('/archived', protect, getArchivedNotes);
router.get('/trashed', protect, getTrashedNotes);
router.get('/shared', protect, getSharedNotes);
router.get('/search', protect, searchNotes);
router.get('/tags', protect, getTags);

router.route('/:id').patch(protect, updateNote).delete(protect, deleteNote);
router.post('/:id/share', protect, shareNote);
router.post('/:id/share-user', protect, shareNoteWithUser);
router.post('/:id/connect', protect, addConnection);
router.delete('/:id/connect/:targetId', protect, removeConnection);
router.get('/share/:token', getSharedNote); // Public route

export default router;
