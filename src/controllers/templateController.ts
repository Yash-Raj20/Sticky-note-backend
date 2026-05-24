import { Request, Response } from 'express';
import Template from '../models/Template';

interface AuthRequest extends Request {
  user?: any;
}

// GET /api/templates — user ke saare saved templates
export const getTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const templates = await Template.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/templates — naya custom template save karo
export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, emoji, notes } = req.body;
    if (!name || !notes?.length) {
      return res.status(400).json({ success: false, message: 'Name and notes are required' });
    }
    const template = await Template.create({
      userId: req.user.id,
      name, description: description || '', emoji: emoji || '📋', notes,
    });
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/templates/:id — template delete karo
export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const template = await Template.findOne({ _id: req.params.id, userId: req.user.id });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    await template.deleteOne();
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/templates/:id/favorite — favorite toggle karo
export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const template = await Template.findOne({ _id: req.params.id, userId: req.user.id });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    template.isFavorite = !template.isFavorite;
    await template.save();
    res.json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/templates/favorites — sirf favorited templates
export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const templates = await Template.find({ userId: req.user.id, isFavorite: true }).sort({ updatedAt: -1 });
    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

