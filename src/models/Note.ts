import mongoose, { Document, Model } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId | null;
  title: string;
  content: string;       // TipTap HTML
  color: string;
  tags: string[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  shareToken: string | null;
  isPublic: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  sharedWith: mongoose.Types.ObjectId[];
  connections: { targetId: mongoose.Types.ObjectId }[];
  attachments: { url: string; type: string; name: string; x?: number; y?: number; width?: number; height?: number }[];
  lastEditedBy: string | null;
  reactions: Record<string, string[]>; // emoji -> array of user names/IDs
  isFrame: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    boardId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Board', default: null },
    title:     { type: String, default: '' },
    content:   { type: String, default: '' },
    color:     { type: String, default: 'yellow' },
    tags:      [{ type: String }],
    position:  { x: { type: Number, default: 0 }, y: { type: Number, default: 0 } },
    size:      { width: { type: Number, default: 200 }, height: { type: Number, default: 200 } },
    isFrame:   { type: Boolean, default: false },
    shareToken: { type: String, default: null },
    isPublic:   { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isTrashed:  { type: Boolean, default: false },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    connections: [
      {
        targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' }
      }
    ],
    attachments: [
      {
        url:    { type: String, required: true },
        type:   { type: String, default: 'image' },
        name:   { type: String, default: '' },
        x:      { type: Number, default: 8 },
        y:      { type: Number, default: 8 },
        width:  { type: Number, default: 160 },
        height: { type: Number, default: 110 }
      }
    ],
    lastEditedBy: { type: String, default: null },
    reactions: { type: Map, of: [String], default: {} },
  },
  { timestamps: true }
);

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);
export default Note;
