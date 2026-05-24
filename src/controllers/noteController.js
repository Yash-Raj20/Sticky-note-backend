"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeConnection = exports.addConnection = exports.shareNoteWithUser = exports.getTags = exports.searchNotes = exports.getSharedNote = exports.shareNote = exports.deleteNote = exports.updateNote = exports.createNote = exports.getSharedNotes = exports.getTrashedNotes = exports.getArchivedNotes = exports.getNotes = void 0;
const Note_1 = __importDefault(require("../models/Note"));
const User_1 = __importDefault(require("../models/User"));
const uuid_1 = require("uuid");
const getNotes = async (req, res) => {
    try {
        const { boardId } = req.query;
        const filter = {
            userId: req.user.id,
            isArchived: { $ne: true },
            isTrashed: { $ne: true },
        };
        // If boardId is provided, filter by it; otherwise null (default board)
        if (boardId)
            filter.boardId = boardId;
        else
            filter.boardId = null;
        const notes = await Note_1.default.find(filter).populate('sharedWith', 'name email');
        res.json({ success: true, statusCode: 200, message: 'Notes retrieved successfully', data: notes });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.getNotes = getNotes;
const getArchivedNotes = async (req, res) => {
    try {
        const notes = await Note_1.default.find({
            userId: req.user.id,
            isArchived: true,
            isTrashed: { $ne: true }
        }).populate('sharedWith', 'name email');
        res.json({ success: true, statusCode: 200, message: 'Archived notes retrieved successfully', data: notes });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.getArchivedNotes = getArchivedNotes;
const getTrashedNotes = async (req, res) => {
    try {
        const notes = await Note_1.default.find({
            userId: req.user.id,
            isTrashed: true
        });
        res.json({ success: true, statusCode: 200, message: 'Trashed notes retrieved successfully', data: notes });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.getTrashedNotes = getTrashedNotes;
const getSharedNotes = async (req, res) => {
    try {
        const notes = await Note_1.default.find({
            $or: [
                { sharedWith: req.user.id },
                {
                    userId: req.user.id,
                    $or: [
                        { 'sharedWith.0': { $exists: true } },
                        { isPublic: true }
                    ]
                }
            ],
            isTrashed: { $ne: true }
        }).populate('sharedWith', 'name email').populate('userId', 'name email');
        res.json({ success: true, statusCode: 200, message: 'Shared notes retrieved successfully', data: notes });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.getSharedNotes = getSharedNotes;
const createNote = async (req, res) => {
    try {
        const { title, content, color, position, size, tags, boardId, isFrame } = req.body;
        const note = await Note_1.default.create({
            userId: req.user.id,
            boardId: boardId || null,
            title,
            content,
            color,
            position,
            size,
            tags,
            isFrame: isFrame || false
        });
        res.status(201).json({ success: true, statusCode: 201, message: 'Note created successfully', data: note });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.createNote = createNote;
const updateNote = async (req, res) => {
    try {
        const note = await Note_1.default.findById(req.params.id);
        if (!note) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' });
            return;
        }
        if (note.userId.toString() !== req.user.id &&
            !note.sharedWith.includes(req.user.id) &&
            !note.isPublic // If it's public (shared via link), anyone logged in can update it (or we can restrict to just sharedWith)
        ) {
            res.status(401).json({ success: false, statusCode: 401, message: 'User not authorized' });
            return;
        }
        // Track who last edited (only for content/title changes, not position/size drags)
        const updates = { ...req.body };
        if (updates.content !== undefined || updates.title !== undefined) {
            const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
            const editor = await User.findById(req.user.id).select('name');
            updates.lastEditedBy = editor?.name || 'Unknown';
        }
        const updatedNote = await Note_1.default.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after' });
        res.json({ success: true, statusCode: 200, message: 'Note updated successfully', data: updatedNote });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.updateNote = updateNote;
const deleteNote = async (req, res) => {
    try {
        const note = await Note_1.default.findById(req.params.id);
        if (!note) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' });
            return;
        }
        if (note.userId.toString() !== req.user.id) {
            res.status(401).json({ success: false, statusCode: 401, message: 'User not authorized' });
            return;
        }
        await note.deleteOne();
        res.json({ success: true, statusCode: 200, message: 'Note removed successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.deleteNote = deleteNote;
const shareNote = async (req, res) => {
    try {
        const note = await Note_1.default.findById(req.params.id);
        if (!note) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' });
            return;
        }
        if (note.userId.toString() !== req.user.id) {
            res.status(401).json({ success: false, statusCode: 401, message: 'User not authorized' });
            return;
        }
        if (!note.shareToken) {
            note.shareToken = (0, uuid_1.v4)();
            note.isPublic = true;
            await note.save();
        }
        res.json({ success: true, statusCode: 200, message: 'Share token generated', data: { shareToken: note.shareToken } });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.shareNote = shareNote;
const getSharedNote = async (req, res) => {
    try {
        const note = await Note_1.default.findOne({ shareToken: req.params.token, isPublic: true }).populate('userId', 'name');
        if (!note) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Note not found or not public' });
            return;
        }
        res.json({ success: true, statusCode: 200, message: 'Shared note retrieved successfully', data: note });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.getSharedNote = getSharedNote;
const searchNotes = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            res.json({ success: true, statusCode: 200, message: 'No query provided', data: [] });
            return;
        }
        const regex = new RegExp(query, 'i');
        const notes = await Note_1.default.find({
            userId: req.user.id,
            isTrashed: { $ne: true },
            $or: [
                { title: { $regex: regex } },
                { content: { $regex: regex } },
                { tags: { $in: [regex] } }
            ]
        }).populate('sharedWith', 'name email');
        res.json({ success: true, statusCode: 200, message: 'Search results', data: notes });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.searchNotes = searchNotes;
const getTags = async (req, res) => {
    try {
        const tags = await Note_1.default.distinct('tags', { userId: req.user.id, isTrashed: { $ne: true } });
        res.json({ success: true, statusCode: 200, message: 'Tags retrieved successfully', data: tags });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.getTags = getTags;
const shareNoteWithUser = async (req, res) => {
    try {
        const { email } = req.body;
        const note = await Note_1.default.findById(req.params.id);
        if (!note) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' });
            return;
        }
        if (note.userId.toString() !== req.user.id) {
            res.status(401).json({ success: false, statusCode: 401, message: 'User not authorized' });
            return;
        }
        const targetUser = await User_1.default.findOne({ email });
        if (!targetUser) {
            res.status(404).json({ success: false, statusCode: 404, message: 'User with this email not found' });
            return;
        }
        if (targetUser._id.toString() === req.user.id) {
            res.status(400).json({ success: false, statusCode: 400, message: 'You cannot share a note with yourself' });
            return;
        }
        if (note.sharedWith.includes(targetUser._id)) {
            res.status(400).json({ success: false, statusCode: 400, message: 'Note is already shared with this user' });
            return;
        }
        note.sharedWith.push(targetUser._id);
        await note.save();
        // Populate the newly added user before returning
        await note.populate('sharedWith', 'name email');
        res.json({ success: true, statusCode: 200, message: 'Note shared successfully', data: note });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.shareNoteWithUser = shareNoteWithUser;
/** POST /api/notes/:id/connect — Add a connection arrow to another note */
const addConnection = async (req, res) => {
    try {
        const { targetId } = req.body;
        const note = await Note_1.default.findById(req.params.id);
        if (!note) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' });
            return;
        }
        if (note.userId.toString() !== req.user.id) {
            res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized' });
            return;
        }
        const alreadyConnected = note.connections.some(c => c.targetId.toString() === targetId);
        if (alreadyConnected) {
            res.status(400).json({ success: false, statusCode: 400, message: 'Already connected' });
            return;
        }
        note.connections.push({ targetId });
        await note.save();
        res.json({ success: true, statusCode: 200, message: 'Connection added', data: note });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.addConnection = addConnection;
/** DELETE /api/notes/:id/connect/:targetId — Remove a connection */
const removeConnection = async (req, res) => {
    try {
        const note = await Note_1.default.findById(req.params.id);
        if (!note) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' });
            return;
        }
        if (note.userId.toString() !== req.user.id) {
            res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized' });
            return;
        }
        note.connections = note.connections.filter(c => c.targetId.toString() !== req.params.targetId);
        await note.save();
        res.json({ success: true, statusCode: 200, message: 'Connection removed', data: note });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.removeConnection = removeConnection;
//# sourceMappingURL=noteController.js.map