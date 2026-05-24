"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const boardController_1 = require("../controllers/boardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/').get(authMiddleware_1.protect, boardController_1.getBoards).post(authMiddleware_1.protect, boardController_1.createBoard);
router.route('/:id').patch(authMiddleware_1.protect, boardController_1.updateBoard).delete(authMiddleware_1.protect, boardController_1.deleteBoard);
exports.default = router;
//# sourceMappingURL=boardRoutes.js.map