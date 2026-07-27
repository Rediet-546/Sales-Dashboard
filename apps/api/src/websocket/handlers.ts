import { Server, Socket } from 'socket.io';

export function setupWebSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Join a room for metric updates
    socket.on('join-metric-room', (dashboardId: string) => {
      socket.join(`dashboard-${dashboardId}`);
      console.log(`📊 Client ${socket.id} joined dashboard-${dashboardId}`);
    });

    // Handle metric updates from client
    socket.on('metric-update', (data: any) => {
      // Broadcast to all clients in the room
      io.to(`dashboard-${data.dashboardId}`).emit('metric-updated', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
}