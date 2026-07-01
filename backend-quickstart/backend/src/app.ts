import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { setupWebSocket } from './websocket/socketServer';

import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patients.routes';
import visitRoutes from './routes/visits.routes';
import vitalsRoutes from './routes/vitals.routes';
import alertsRoutes from './routes/alerts.routes';
import staffRoutes from './routes/staff.routes';
import labsRoutes from './routes/labs.routes';
import analyticsRoutes from './routes/analytics.routes';
import settingsRoutes from './routes/settings.routes';
import reportsRoutes from './routes/reports.routes';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Setup WebSocket
const io = setupWebSocket(httpServer);
app.set('io', io);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/labs', labsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'er-dashboard-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'ER Dashboard Backend API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = parseInt(process.env.PORT || '5000', 10);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 ER Dashboard Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔗 API: http://localhost:${PORT}/api/health`);
});
