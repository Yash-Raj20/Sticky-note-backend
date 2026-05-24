"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const noteRoutes_1 = __importDefault(require("./routes/noteRoutes"));
const boardRoutes_1 = __importDefault(require("./routes/boardRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const socketHandler_1 = require("./socketHandler");
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// --- CORS ---
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:3000'];
app.use((0, cors_1.default)({ origin: allowedOrigins, credentials: true }));
app.use(express_1.default.json());
// --- Socket.io ---
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
});
(0, socketHandler_1.initSocketHandlers)(io);
// --- REST API ---
app.use('/api/auth', authRoutes_1.default);
app.use('/api/notes', noteRoutes_1.default);
app.use('/api/boards', boardRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.get('/', (_req, res) => res.send('API is running...'));
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=server.js.map