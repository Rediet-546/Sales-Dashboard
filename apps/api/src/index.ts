import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { connectDatabase } from './config/database';
import { redis } from './config/redis';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// Initialize Socket.io
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io',
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('subscribe-metrics', () => {
    console.log('📊 Client subscribed to metrics');
    // Send initial data
    socket.emit('metric-update', {
      name: 'Welcome',
      value: 100,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('unsubscribe-metrics', () => {
    console.log('📊 Client unsubscribed from metrics');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io available in routes
app.set('io', io);

// Routes
app.use('/api', routes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    
    // Check Redis connection
    await redis.ping();
    console.log('✅ Redis connected successfully');
    
    server.listen(PORT, () => {
      console.log(`✅ API server running on http://localhost:${PORT}`);
      console.log(`✅ WebSocket server running on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});