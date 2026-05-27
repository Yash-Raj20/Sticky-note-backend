import { Request, Response } from 'express';
import Board from '../models/Board';
import Note from '../models/Note';
import User from '../models/User';
import sendEmail from '../utils/sendEmail';
import { getShareBoardEmailTemplate, getInviteBoardEmailTemplate } from '../utils/emailTemplates';

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
      // User is not registered yet. Add to invitedEmails and send an invite email.
      if (board.invitedEmails && board.invitedEmails.includes(email.toLowerCase())) {
        res.status(400).json({ success: false, statusCode: 400, message: 'An invite has already been sent to this email' });
        return;
      }

      if (!board.invitedEmails) board.invitedEmails = [];
      board.invitedEmails.push(email.toLowerCase());
      await board.save();

      // Send Invite Email Notification
      try {
        const sender = await User.findById(req.user.id);
        const senderName = sender ? sender.name : 'Someone';
        
        const inviteHtml = getInviteBoardEmailTemplate(
          email,
          senderName,
          board.name,
          board.emoji,
          board._id.toString()
        );

        sendEmail({
          email: email,
          subject: `${senderName} invited you to join Sticky Notes!`,
          message: `Hello, ${senderName} invited you to view the board "${board.name}". Please sign up at ${process.env.CLIENT_URL}/register?boardId=${board._id} to view it.`,
          html: inviteHtml
        }).catch((err) => console.error('Background invite email failed:', err));
      } catch (err) {
        console.error('Error preparing invite email:', err);
      }

      const populatedBoard = await Board.findById(board._id)
        .populate('userId', 'name email avatar')
        .populate('sharedWith', 'name email avatar');

      res.json({ success: true, statusCode: 200, message: 'Invite sent to unregistered user successfully', data: populatedBoard });
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
    
    // Send Email Notification in the background (fire-and-forget)
    try {
      const sender = await User.findById(req.user.id);
      const senderName = sender ? sender.name : 'Someone';
      
      const htmlTemplate = getShareBoardEmailTemplate(
        targetUser.name,
        senderName,
        board.name,
        board.emoji,
        board._id.toString()
      );
      
      // Do not await this, let it run in the background
      sendEmail({
        email: targetUser.email,
        subject: `${senderName} shared a board with you: "${board.name}"`,
        message: `Hello ${targetUser.name}, ${senderName} has shared a board titled "${board.name}" with you.`,
        html: htmlTemplate
      }).catch((emailError) => {
        console.error('Background email sending failed:', emailError);
      });
    } catch (err) {
      console.error('Error preparing email:', err);
    }
    
    await board.populate('sharedWith', 'name email');
    res.json({ success: true, statusCode: 200, message: 'Board shared successfully', data: board });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

