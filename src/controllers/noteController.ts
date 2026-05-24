import { Request, Response } from 'express';
import Note from '../models/Note';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';

interface AuthRequest extends Request {
  user?: any;
}

export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.query;
    const filter: Record<string, any> = {
      userId: req.user.id,
      isArchived: { $ne: true },
      isTrashed: { $ne: true },
    };
    // If boardId is provided, filter by it; otherwise null (default board)
    if (boardId) filter.boardId = boardId;
    else filter.boardId = null;

    const notes = await Note.find(filter).populate('sharedWith', 'name email');
    res.json({ success: true, statusCode: 200, message: 'Notes retrieved successfully', data: notes });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const getArchivedNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ 
      userId: req.user.id, 
      isArchived: true, 
      isTrashed: { $ne: true } 
    }).populate('sharedWith', 'name email');
    res.json({ success: true, statusCode: 200, message: 'Archived notes retrieved successfully', data: notes });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const getTrashedNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ 
      userId: req.user.id, 
      isTrashed: true 
    });
    res.json({ success: true, statusCode: 200, message: 'Trashed notes retrieved successfully', data: notes });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const getSharedNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ 
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
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, color, position, size, tags, boardId, isFrame } = req.body;
    const note = await Note.create({
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
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' });
      return;
    }
    if (
      note.userId.toString() !== req.user.id && 
      !note.sharedWith.includes(req.user.id as any) &&
      !note.isPublic // If it's public (shared via link), anyone logged in can update it (or we can restrict to just sharedWith)
    ) {
      res.status(401).json({ success: false, statusCode: 401, message: 'User not authorized' });
      return;
    }

    // Track who last edited (only for content/title changes, not position/size drags)
    const updates = { ...req.body };
    if (updates.content !== undefined || updates.title !== undefined) {
      const User = (await import('../models/User')).default;
      const editor = await User.findById(req.user.id).select('name');
      updates.lastEditedBy = editor?.name || 'Unknown';
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after' });
    res.json({ success: true, statusCode: 200, message: 'Note updated successfully', data: updatedNote });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id);
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
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const shareNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' });
      return;
    }
    if (note.userId.toString() !== req.user.id) {
      res.status(401).json({ success: false, statusCode: 401, message: 'User not authorized' });
      return;
    }

    if (!note.shareToken) {
      note.shareToken = uuidv4();
      note.isPublic = true;
      await note.save();
    }
    res.json({ success: true, statusCode: 200, message: 'Share token generated', data: { shareToken: note.shareToken } });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const getSharedNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await Note.findOne({ shareToken: req.params.token, isPublic: true }).populate('userId', 'name');
    if (!note) {
      res.status(404).json({ success: false, statusCode: 404, message: 'Note not found or not public' });
      return;
    }
    res.json({ success: true, statusCode: 200, message: 'Shared note retrieved successfully', data: note });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const searchNotes = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.json({ success: true, statusCode: 200, message: 'No query provided', data: [] });
      return;
    }
    
    const regex = new RegExp(query, 'i');
    const notes = await Note.find({
      userId: req.user.id,
      isTrashed: { $ne: true },
      $or: [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
        { tags: { $in: [regex] } }
      ]
    }).populate('sharedWith', 'name email');
    
    res.json({ success: true, statusCode: 200, message: 'Search results', data: notes });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const getTags = async (req: AuthRequest, res: Response) => {
  try {
    const tags = await Note.distinct('tags', { userId: req.user.id, isTrashed: { $ne: true } });
    res.json({ success: true, statusCode: 200, message: 'Tags retrieved successfully', data: tags });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const shareNoteWithUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' });
      return;
    }
    if (note.userId.toString() !== req.user.id) {
      res.status(401).json({ success: false, statusCode: 401, message: 'User not authorized' });
      return;
    }
    
    const targetUser = await User.findOne({ email });
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
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

/** POST /api/notes/:id/connect — Add a connection arrow to another note */
export const addConnection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetId } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) { res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' }); return; }
    if (note.userId.toString() !== req.user.id) { res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized' }); return; }
    
    const alreadyConnected = note.connections.some(c => c.targetId.toString() === targetId);
    if (alreadyConnected) { res.status(400).json({ success: false, statusCode: 400, message: 'Already connected' }); return; }
    
    note.connections.push({ targetId });
    await note.save();
    res.json({ success: true, statusCode: 200, message: 'Connection added', data: note });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

/** DELETE /api/notes/:id/connect/:targetId — Remove a connection */
export const removeConnection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) { res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' }); return; }
    if (note.userId.toString() !== req.user.id) { res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized' }); return; }
    
    note.connections = note.connections.filter(c => c.targetId.toString() !== req.params.targetId);
    await note.save();
    res.json({ success: true, statusCode: 200, message: 'Connection removed', data: note });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

/** POST /api/notes/:id/comments — Add a comment to a note */
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text?.trim()) { res.status(400).json({ success: false, statusCode: 400, message: 'Comment text is required' }); return; }

    const note = await Note.findById(req.params.id);
    if (!note) { res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' }); return; }

    // Optional: check if authorized (owner, shared, or public)
    if (note.userId.toString() !== req.user.id && !note.sharedWith.includes(req.user.id as any) && !note.isPublic) {
      res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized' }); return;
    }

    const User = (await import('../models/User')).default;
    const author = await User.findById(req.user.id).select('name avatar');

    const newComment = {
      id: uuidv4(),
      userId: req.user.id,
      userName: author?.name || 'Anonymous',
      userAvatar: author?.avatar || '',
      text: text.trim(),
      createdAt: new Date()
    };

    note.comments.push(newComment);
    await note.save();
    
    res.json({ success: true, statusCode: 200, message: 'Comment added', data: note });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

/** DELETE /api/notes/:id/comments/:commentId — Delete a comment */
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) { res.status(404).json({ success: false, statusCode: 404, message: 'Note not found' }); return; }

    const comment = note.comments.find(c => c.id === req.params.commentId);
    if (!comment) { res.status(404).json({ success: false, statusCode: 404, message: 'Comment not found' }); return; }

    // Only the comment author or the note owner can delete the comment
    if (comment.userId !== req.user.id && note.userId.toString() !== req.user.id) {
      res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized to delete this comment' }); return;
    }

    note.comments = note.comments.filter(c => c.id !== req.params.commentId);
    await note.save();
    
    res.json({ success: true, statusCode: 200, message: 'Comment deleted', data: note });
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};
