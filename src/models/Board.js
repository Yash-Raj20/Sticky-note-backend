"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const boardSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    emoji: { type: String, default: '📋' },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
const Board = mongoose_1.default.models.Board || mongoose_1.default.model('Board', boardSchema);
exports.default = Board;
//# sourceMappingURL=Board.js.map