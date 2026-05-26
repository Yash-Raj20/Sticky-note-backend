import mongoose, { Document, Model } from 'mongoose';

export interface IBoard extends Document {
  name: string;
  emoji: string;
  userId: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    emoji: { type: String, default: '📋' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Board: Model<IBoard> =
  mongoose.models.Board || mongoose.model<IBoard>('Board', boardSchema);

export default Board;
