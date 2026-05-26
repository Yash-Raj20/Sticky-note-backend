import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

import User from './models/User';

interface AuthSocket extends Socket {
  userId?: string;
  userName?: string;
}

/**
 * Attaches all Socket.io event handlers to the server.
 * Handles: board rooms, cursor tracking, note updates, note moves.
 */
export const initSocketHandlers = (io: Server) => {
  // --- Auth Middleware ---
  io.use(async (socket: AuthSocket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      socket.userId = decoded.id;
      
      // Look up the user to get their actual name (handles old tokens missing name)
      const user = await User.findById(decoded.id).select('name');
      socket.userName = user?.name || decoded.name || 'Anonymous';
      
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    // --- Join a board room ---
    socket.on('join-board', (boardId: string) => {
      socket.join(`board:${boardId}`);
      socket.to(`board:${boardId}`).emit('user-joined', {
        userId: socket.userId,
        name: socket.userName,
      });
    });

    // --- Leave a board room ---
    socket.on('leave-board', (boardId: string) => {
      socket.leave(`board:${boardId}`);
      socket.to(`board:${boardId}`).emit('user-left', { userId: socket.userId });
    });

    // --- Cursor move (broadcast to room, not self) ---
    socket.on('cursor-move', ({ boardId, x, y, isLaser }: { boardId: string; x: number; y: number; isLaser?: boolean }) => {
      socket.to(`board:${boardId}`).emit('remote-cursor', {
        userId: socket.userId,
        name: socket.userName,
        x,
        y,
        isLaser,
      });
    });

    // --- Note moved ---
    socket.on('note-moved', ({ boardId, noteId, position }: { boardId: string; noteId: string; position: { x: number; y: number } }) => {
      socket.to(`board:${boardId}`).emit('remote-note-moved', { noteId, position });
    });

    // --- Note content updated ---
    socket.on('note-updated', ({ boardId, noteId, updates }: { boardId: string; noteId: string; updates: Record<string, any> }) => {
      socket.to(`board:${boardId}`).emit('remote-note-updated', { noteId, updates });
    });

    // --- Note created ---
    socket.on('note-created', ({ boardId, note }: { boardId: string; note: any }) => {
      socket.to(`board:${boardId}`).emit('remote-note-created', { note });
    });

    // --- Note deleted ---
    socket.on('note-deleted', ({ boardId, noteId }: { boardId: string; noteId: string }) => {
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
