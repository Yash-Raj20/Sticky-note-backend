import { Request, Response } from 'express';
import Board from '../models/Board';
import Note from '../models/Note';
import User from '../models/User';
import sendEmail from '../utils/sendEmail';
import { getShareBoardEmailTemplate } from '../utils/emailTemplates';

interface AuthRequest extends Request {
  user?: any;
}

/** GET /api/boards — Get all boards for the logged-in user */
export const getBoards = async (req: AuthRequest, res: Response) => {
  try {
    const boards = await Board.find({
      $or: [{ userId: req.user.id }, { sharedWith: req.user.id }]
    }).sort({ createdAt: 1 })
      .populate('userId', 'name email')
      .populate('sharedWith', 'name email');
    res.json({ success: true, statusCode: 200, message: 'Boards retrieved successfully', data: boards });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

/** POST /api/boards — Create a new board */
export const createBoard = async (req: AuthRequest, res: Response) => {
  try {
    const { name, emoji } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ success: false, statusCode: 400, message: 'Board name is required' });
      return;
    }
    const board = await Board.create({ name: name.trim(), emoji: emoji || '📋', userId: req.user.id });
    res.status(201).json({ success: true, statusCode: 201, message: 'Board created successfully', data: board });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

/** PATCH /api/boards/:id — Rename a board */
export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      res.status(404).json({ success: false, statusCode: 404, message: 'Board not found' });
      return;
    }
    if (board.userId.toString() !== req.user.id) {
      res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized' });
      return;
    }
    const { name, emoji } = req.body;
    if (name) board.name = name.trim();
    if (emoji) board.emoji = emoji;
    await board.save();
    res.json({ success: true, statusCode: 200, message: 'Board updated successfully', data: board });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

/** DELETE /api/boards/:id — Delete board and all its notes */
export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      res.status(404).json({ success: false, statusCode: 404, message: 'Board not found' });
      return;
    }
    if (board.userId.toString() !== req.user.id) {
      res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized' });
      return;
    }
    // Cascade delete all notes in this board
    await Note.deleteMany({ boardId: board._id });
    await board.deleteOne();
    res.json({ success: true, statusCode: 200, message: 'Board and all its notes deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

/** POST /api/boards/:id/share — Share board with a user via email */
export const shareBoardWithUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      res.status(404).json({ success: false, statusCode: 404, message: 'Board not found' });
      return;
    }
    if (board.userId.toString() !== req.user.id) {
      res.status(401).json({ success: false, statusCode: 401, message: 'User not authorized' });
      return;
    }
    
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      res.status(404).json({ success: false, statusCode: 404, message: 'User with this email not found' });
      return;
    }
    
    if (targetUser._id.toString() === req.user.id) {
      res.status(400).json({ success: false, statusCode: 400, message: 'You cannot share a board with yourself' });
      return;
    }
    
    if (board.sharedWith.includes(targetUser._id)) {
      res.status(400).json({ success: false, statusCode: 400, message: 'Board is already shared with this user' });
      return;
    }
    
    board.sharedWith.push(targetUser._id);
    await board.save();
    
    // Send Email Notification
    try {
      const sender = await User.findById(req.user.id);
      const senderName = sender ? sender.name : 'Someone';
      
      const htmlTemplate = getShareBoardEmailTemplate(
        targetUser.name,
        senderName,
        board.name,
        board.emoji
      );
      
      await sendEmail({
        email: targetUser.email,
        subject: `${senderName} shared a board with you: "${board.name}"`,
        message: `Hello ${targetUser.name}, ${senderName} has shared a board titled "${board.name}" with you.`,
        html: htmlTemplate
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }
    
    await board.populate('sharedWith', 'name email');
    res.json({ success: true, statusCode: 200, message: 'Board shared successfully', data: board });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};
