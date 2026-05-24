"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Lazily configure Cloudinary so dotenv has already run
function getCloudinary() {
    cloudinary_1.default.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return cloudinary_1.default.v2;
}
// Cloudinary multer storage
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: getCloudinary(),
    params: async (_req, file) => ({
        folder: 'stickynotes-attachments',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
        resource_type: file.mimetype.startsWith('image/') ? 'image' : 'raw',
        use_filename: true,
        unique_filename: true,
    }),
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});
/** POST /api/upload — Upload a file and return its URL */
const uploadFile = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, statusCode: 400, message: 'No file provided' });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: 'File uploaded successfully',
            data: {
                url: file.path, // Cloudinary HTTPS URL
                name: file.originalname,
                type: file.mimetype.startsWith('image/') ? 'image' : 'file',
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
};
exports.uploadFile = uploadFile;
//# sourceMappingURL=uploadController.js.map