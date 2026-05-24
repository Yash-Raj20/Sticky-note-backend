"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const noteController_1 = require("../controllers/noteController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/').get(authMiddleware_1.protect, noteController_1.getNotes).post(authMiddleware_1.protect, noteController_1.createNote);
// Specific GET routes must come before /:id routes
router.get('/archived', authMiddleware_1.protect, noteController_1.getArchivedNotes);
router.get('/trashed', authMiddleware_1.protect, noteController_1.getTrashedNotes);
router.get('/shared', authMiddleware_1.protect, noteController_1.getSharedNotes);
router.get('/search', authMiddleware_1.protect, noteController_1.searchNotes);
router.get('/tags', authMiddleware_1.protect, noteController_1.getTags);
router.route('/:id').patch(authMiddleware_1.protect, noteController_1.updateNote).delete(authMiddleware_1.protect, noteController_1.deleteNote);
router.post('/:id/share', authMiddleware_1.protect, noteController_1.shareNote);
router.post('/:id/share-user', authMiddleware_1.protect, noteController_1.shareNoteWithUser);
router.post('/:id/connect', authMiddleware_1.protect, noteController_1.addConnection);
router.delete('/:id/connect/:targetId', authMiddleware_1.protect, noteController_1.removeConnection);
router.get('/share/:token', noteController_1.getSharedNote); // Public route
exports.default = router;
//# sourceMappingURL=noteRoutes.js.map