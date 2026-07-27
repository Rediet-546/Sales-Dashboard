import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { websocketHandlers } from './websocket/handlers';
import logger from './utils/logger';

const app = express();
const port = process.env.PORT || 3002;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  websocketHandlers(ws, wss);
});

server.listen(port, () => {
  logger.info(`WebSocket server is running on port ${port}`);
});
