import { WebSocket } from 'ws';
import { randomUUID } from 'crypto';

interface Connection {
  id: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  connectedAt: Date;
}

export class ConnectionManager {
  private connections: Map<string, Connection> = new Map();

  addConnection(ws: WebSocket): string {
    const id = randomUUID();
    this.connections.set(id, {
      id,
      ws,
      subscriptions: new Set(),
      connectedAt: new Date()
    });
    return id;
  }

  removeConnection(id: string): void {
    this.connections.delete(id);
  }

  getConnection(id: string): Connection | undefined {
    return this.connections.get(id);
  }

  subscribe(clientId: string, metricIds: string[]): void {
    const connection = this.connections.get(clientId);
    if (connection) {
      metricIds.forEach(id => connection.subscriptions.add(id));
    }
  }

  unsubscribe(clientId: string, metricIds: string[]): void {
    const connection = this.connections.get(clientId);
    if (connection) {
      metricIds.forEach(id => connection.subscriptions.delete(id));
    }
  }

  getSubscribers(metricId: string): Connection[] {
    const subscribers: Connection[] = [];
    for (const [, connection] of this.connections) {
      if (connection.subscriptions.has(metricId)) {
        subscribers.push(connection);
      }
    }
    return subscribers;
  }

  getActiveConnections(): number {
    return this.connections.size;
  }

  getConnectionStats(): any {
    const total = this.connections.size;
    let active = 0;
    const subscriptions: string[] = [];

    for (const [, connection] of this.connections) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        active++;
      }
      connection.subscriptions.forEach(id => {
        if (!subscriptions.includes(id)) {
          subscriptions.push(id);
        }
      });
    }

    return {
      total,
      active,
      subscriptions: subscriptions.length
    };
  }
}