"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
const authMiddleware_1 = require("../middleware/authMiddleware");
router.post('/register', authController_1.registerUser);
router.post('/login', authController_1.loginUser);
router.put('/profile', authMiddleware_1.protect, authController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map