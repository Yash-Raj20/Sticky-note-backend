import mongoose, { Document, Model } from 'mongoose';
export interface INote extends Document {
    userId: mongoose.Types.ObjectId;
    boardId: mongoose.Types.ObjectId | null;
    title: string;
    content: string;
    color: string;
    tags: string[];
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    shareToken: string | null;
    isPublic: boolean;
    isArchived: boolean;
    isTrashed: boolean;
    sharedWith: mongoose.Types.ObjectId[];
    connections: {
        targetId: mongoose.Types.ObjectId;
    }[];
    attachments: {
        url: string;
        type: string;
        name: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    }[];
    lastEditedBy: string | null;
    reactions: Record<string, string[]>;
    isFrame: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Note: Model<INote>;
export default Note;
//# sourceMappingURL=Note.d.ts.map