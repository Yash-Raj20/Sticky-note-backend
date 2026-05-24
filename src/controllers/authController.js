"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (id, name, email) => {
    return jsonwebtoken_1.default.sign({ id, name, email }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ success: false, statusCode: 400, message: 'User already exists' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const user = await User_1.default.create({ name, email, passwordHash });
        if (user) {
            res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'User registered successfully',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id.toString(), user.name, user.email),
                }
            });
        }
        else {
            res.status(400).json({ success: false, statusCode: 400, message: 'Invalid user data' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (user && (await bcryptjs_1.default.compare(password, user.passwordHash))) {
            res.json({
                success: true,
                statusCode: 200,
                message: 'Login successful',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id.toString(), user.name, user.email),
                }
            });
        }
        else {
            res.status(401).json({ success: false, statusCode: 401, message: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.loginUser = loginUser;
const updateProfile = async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const user = await User_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({ success: false, statusCode: 404, message: 'User not found' });
            return;
        }
        if (name)
            user.name = name;
        if (avatar !== undefined)
            user.avatar = avatar;
        await user.save();
        res.json({
            success: true,
            statusCode: 200,
            message: 'Profile updated successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                token: generateToken(user._id.toString(), user.name, user.email) // token might not need avatar, but just in case
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=authController.js.map