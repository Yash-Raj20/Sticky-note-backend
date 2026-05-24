import mongoose, { Document, Model } from 'mongoose';
export interface IBoard extends Document {
    name: string;
    emoji: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const Board: Model<IBoard>;
export default Board;
//# sourceMappingURL=Board.d.ts.map