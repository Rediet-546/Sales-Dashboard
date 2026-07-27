import { WebSocket } from 'ws';
import { ConnectionManager } from './connectionManager';
import { metricRepository } from '../repositories/metricRepository';
import logger from '../utils/logger';

const connectionManager = new ConnectionManager();

export const websocketHandlers = (ws: WebSocket, wss: any) => {
  const clientId = connectionManager.addConnection(ws);
  
  logger.info(`WebSocket client ${clientId} connected`);

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'subscribe':
          await handleSubscribe(ws, clientId, data);
          break;
        case 'unsubscribe':
          handleUnsubscribe(clientId, data);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;
        default:
          logger.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      logger.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    connectionManager.removeConnection(clientId);
    logger.info(`WebSocket client ${clientId} disconnected`);
  });

  ws.on('error', (error) => {
    logger.error(`WebSocket client ${clientId} error:`, error);
  });
};

const handleSubscribe = async (ws: WebSocket, clientId: string, data: any) => {
  const { metricIds, interval = 5000 } = data;
  
  connectionManager.subscribe(clientId, metricIds);
  
  // Send initial data
  const initialData = await getMetricData(metricIds);
  ws.send(JSON.stringify({
    type: 'initial',
    data: initialData,
    timestamp: new Date().toISOString()
  }));

  // Start streaming updates
  const streamInterval = setInterval(async () => {
    try {
      const updates = await getMetricData(metricIds);
      ws.send(JSON.stringify({
        type: 'update',
        data: updates,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      logger.error('Stream update error:', error);
    }
  }, interval);

  // Store interval for cleanup
  (ws as any).streamInterval = streamInterval;
};

const handleUnsubscribe = (clientId: string, data: any) => {
  const { metricIds } = data;
  connectionManager.unsubscribe(clientId, metricIds);
};

const getMetricData = async (metricIds: string[]) => {
  const data: any = {};
  
  for (const id of metricIds) {
    const metric = await metricRepository.findById(id);
    const latest = await metricRepository.getLatestValues([id]);
    data[id] = {
      metric: metric?.name,
      value: latest.get(id),
      timestamp: new Date().toISOString()
    };
  }
  
  return data;
};

// Broadcast updates to all connected clients
export const broadcastUpdate = async (wss: any, metricId: string) => {
  const data = await getMetricData([metricId]);
  
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'broadcast',
        data,
        timestamp: new Date().toISOString()
      }));
    }
  });
};