import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export function setupWebSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      // In development, you might want to bypass auth for testing
      // return next(new Error('Authentication error'));
      return next(); // Bypassing for easier local testing right now
    }

    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

    jwt.verify(token, secret, (err: any, decoded: any) => {
      if (err) return next(new Error('Authentication error'));
      
      socket.data.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user?.userId || 'Anonymous'}`);

    if (socket.data.user?.department) {
      // Join department room
      socket.join(`department:${socket.data.user.department}`);
    }

    // Subscribe to patient updates
    socket.on('subscribe:patient', (patientId) => {
      socket.join(`patient:${patientId}`);
      console.log(`Socket joined patient:${patientId}`);
    });

    socket.on('subscribe:queue', () => {
      socket.join('queue');
    });

    socket.on('subscribe:alerts', () => {
      socket.join('alerts');
    });

    socket.on('subscribe:vitals', (visitId) => {
      socket.join(`vitals:${visitId}`);
    });

    socket.on('unsubscribe:vitals', (visitId) => {
      socket.leave(`vitals:${visitId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user?.userId || 'Anonymous'}`);
    });
  });

  return io;
}

// Emit events from anywhere in the app
export function emitVitalUpdate(io: Server, visitId: string, vitals: any) {
  io.to(`patient:${visitId}`).emit('vitals:update', vitals);
  io.to(`vitals:${visitId}`).emit('vitals:update', vitals);
}

export function emitNewAlert(io: Server, alert: any) {
  io.to(`department:${alert.department || 'general'}`).emit('alert:new', alert);
  io.to('alerts').emit('alert:new', alert);
}

export function emitQueueUpdate(io: Server, queueData: any) {
  io.emit('queue:update', queueData);
  io.to('queue').emit('queue:update', queueData);
}

export function emitPatientStatusChange(io: Server, data: any) {
  io.emit('patient:status_change', data);
}

export function emitEsiChange(io: Server, data: any) {
  io.emit('patient:esi_change', data);
}
