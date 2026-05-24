import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import noteRoutes from './routes/noteRoutes';
import boardRoutes from './routes/boardRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { initSocketHandlers } from './socketHandler';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// --- CORS ---
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
const allowedOrigins = [clientUrl, 'http://localhost:3000'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// --- Socket.io ---
const io = new SocketIOServer(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
});
initSocketHandlers(io);

// --- REST API ---
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (_req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
