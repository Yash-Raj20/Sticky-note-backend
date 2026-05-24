"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const noteSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    boardId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Board', default: null },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    color: { type: String, default: 'yellow' },
    tags: [{ type: String }],
    position: { x: { type: Number, default: 0 }, y: { type: Number, default: 0 } },
    size: { width: { type: Number, default: 200 }, height: { type: Number, default: 200 } },
    isFrame: { type: Boolean, default: false },
    shareToken: { type: String, default: null },
    isPublic: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    sharedWith: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    connections: [
        {
            targetId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Note' }
        }
    ],
    attachments: [
        {
            url: { type: String, required: true },
            type: { type: String, default: 'image' },
            name: { type: String, default: '' },
            x: { type: Number, default: 8 },
            y: { type: Number, default: 8 },
            width: { type: Number, default: 160 },
            height: { type: Number, default: 110 }
        }
    ],
    lastEditedBy: { type: String, default: null },
    reactions: { type: Map, of: [String], default: {} },
}, { timestamps: true });
const Note = mongoose_1.default.models.Note || mongoose_1.default.model('Note', noteSchema);
exports.default = Note;
//# sourceMappingURL=Note.js.map