import mongoose, { Document, Model } from 'mongoose';

interface TemplateNote {
  title: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isFrame?: boolean;
}

export interface ITemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  emoji: string;
  notes: TemplateNote[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const templateNoteSchema = new mongoose.Schema({
  title:    { type: String, default: '' },
  content:  { type: String, default: '' },
  color:    { type: String, default: 'yellow' },
  position: { x: { type: Number, default: 0 }, y: { type: Number, default: 0 } },
  size:     { width: { type: Number, default: 250 }, height: { type: Number, default: 250 } },
  isFrame:  { type: Boolean, default: false },
}, { _id: false });

const templateSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  emoji:       { type: String, default: '📋' },
  notes:       { type: [templateNoteSchema], default: [] },
  isFavorite:  { type: Boolean, default: false },
}, { timestamps: true });

const Template: Model<ITemplate> =
  mongoose.models.Template || mongoose.model<ITemplate>('Template', templateSchema);

export default Template;
