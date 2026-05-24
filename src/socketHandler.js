"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketHandlers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("./models/User"));
/**
 * Attaches all Socket.io event handlers to the server.
 * Handles: board rooms, cursor tracking, note updates, note moves.
 */
const initSocketHandlers = (io) => {
    // --- Auth Middleware ---
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error('Authentication required'));
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            // Look up the user to get their actual name (handles old tokens missing name)
            const user = await User_1.default.findById(decoded.id).select('name');
            socket.userName = user?.name || decoded.name || 'Anonymous';
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        // --- Join a board room ---
        socket.on('join-board', (boardId) => {
            socket.join(`board:${boardId}`);
            socket.to(`board:${boardId}`).emit('user-joined', {
                userId: socket.userId,
                name: socket.userName,
            });
        });
        // --- Leave a board room ---
        socket.on('leave-board', (boardId) => {
            socket.leave(`board:${boardId}`);
            socket.to(`board:${boardId}`).emit('user-left', { userId: socket.userId });
        });
        // --- Cursor move (broadcast to room, not self) ---
        socket.on('cursor-move', ({ boardId, x, y }) => {
            socket.to(`board:${boardId}`).emit('remote-cursor', {
                userId: socket.userId,
                name: socket.userName,
                x,
                y,
            });
        });
        // --- Note moved ---
        socket.on('note-moved', ({ boardId, noteId, position }) => {
            socket.to(`board:${boardId}`).emit('remote-note-moved', { noteId, position });
        });
        // --- Note content updated ---
        socket.on('note-updated', ({ boardId, noteId, updates }) => {
            socket.to(`board:${boardId}`).emit('remote-note-updated', { noteId, updates });
        });
        // --- Note created ---
        socket.on('note-created', ({ boardId, note }) => {
            socket.to(`board:${boardId}`).emit('remote-note-created', { note });
        });
        // --- Note deleted ---
        socket.on('note-deleted', ({ boardId, noteId }) => {
            socket.to(`board:${boardId}`).emit('remote-note-deleted', { noteId });
        });
        socket.on('disconnect', () => {
            // Broadcast to all rooms this socket was in
            socket.rooms.forEach((room) => {
                if (room.startsWith('board:')) {
                    socket.to(room).emit('user-left', { userId: socket.userId });
                }
            });
        });
    });
};
exports.initSocketHandlers = initSocketHandlers;
//# sourceMappingURL=socketHandler.js.map