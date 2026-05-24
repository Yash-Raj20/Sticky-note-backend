"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBoard = exports.updateBoard = exports.createBoard = exports.getBoards = void 0;
const Board_1 = __importDefault(require("../models/Board"));
const Note_1 = __importDefault(require("../models/Note"));
/** GET /api/boards — Get all boards for the logged-in user */
const getBoards = async (req, res) => {
    try {
        const boards = await Board_1.default.find({ userId: req.user.id }).sort({ createdAt: 1 });
        res.json({ success: true, statusCode: 200, message: 'Boards retrieved successfully', data: boards });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.getBoards = getBoards;
/** POST /api/boards — Create a new board */
const createBoard = async (req, res) => {
    try {
        const { name, emoji } = req.body;
        if (!name?.trim()) {
            res.status(400).json({ success: false, statusCode: 400, message: 'Board name is required' });
            return;
        }
        const board = await Board_1.default.create({ name: name.trim(), emoji: emoji || '📋', userId: req.user.id });
        res.status(201).json({ success: true, statusCode: 201, message: 'Board created successfully', data: board });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.createBoard = createBoard;
/** PATCH /api/boards/:id — Rename a board */
const updateBoard = async (req, res) => {
    try {
        const board = await Board_1.default.findById(req.params.id);
        if (!board) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Board not found' });
            return;
        }
        if (board.userId.toString() !== req.user.id) {
            res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized' });
            return;
        }
        const { name, emoji } = req.body;
        if (name)
            board.name = name.trim();
        if (emoji)
            board.emoji = emoji;
        await board.save();
        res.json({ success: true, statusCode: 200, message: 'Board updated successfully', data: board });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.updateBoard = updateBoard;
/** DELETE /api/boards/:id — Delete board and all its notes */
const deleteBoard = async (req, res) => {
    try {
        const board = await Board_1.default.findById(req.params.id);
        if (!board) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Board not found' });
            return;
        }
        if (board.userId.toString() !== req.user.id) {
            res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized' });
            return;
        }
        // Cascade delete all notes in this board
        await Note_1.default.deleteMany({ boardId: board._id });
        await board.deleteOne();
        res.json({ success: true, statusCode: 200, message: 'Board and all its notes deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.deleteBoard = deleteBoard;
//# sourceMappingURL=boardController.js.map