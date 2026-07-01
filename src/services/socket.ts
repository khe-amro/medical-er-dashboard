import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || '/';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('er_auth_token');

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToPatient(patientId: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:patient', patientId);
    }
  }

  subscribeToQueue() {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:queue');
    }
  }

  subscribeToAlerts() {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:alerts');
    }
  }

  subscribeToVitals(visitId: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:vitals', visitId);
    }
  }

  unsubscribeFromVitals(visitId: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:vitals', visitId);
    }
  }

  onVitalUpdate(callback: (vitals: any) => void) {
    this.socket?.on('vitals:update', callback);
  }

  onNewAlert(callback: (alert: any) => void) {
    this.socket?.on('alert:new', callback);
  }

  onQueueUpdate(callback: (queueData: any) => void) {
    this.socket?.on('queue:update', callback);
  }

  onPatientStatusChange(callback: (data: any) => void) {
    this.socket?.on('patient:status_change', callback);
  }

  onEsiChange(callback: (data: any) => void) {
    this.socket?.on('patient:esi_change', callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
export default socketService;
