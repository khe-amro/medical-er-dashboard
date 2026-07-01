# Medical ER Triage Dashboard - Complete Backend Implementation Guide

## 📋 Table of Contents
1. [Technology Stack](#technology-stack)
2. [Database Schema](#database-schema)
3. [API Architecture](#api-architecture)
4. [Authentication & Authorization](#authentication--authorization)
5. [Real-Time Features](#real-time-features)
6. [AI/ML Integration](#aiml-integration)
7. [File Storage](#file-storage)
8. [Step-by-Step Implementation](#step-by-step-implementation)

---

## 🛠️ Technology Stack

### Recommended Backend Stack:

#### Option 1: Node.js/Express (Recommended)
```
- Runtime: Node.js 18+
- Framework: Express.js or Fastify
- Database: PostgreSQL 15+
- ORM: Prisma or TypeORM
- Real-time: Socket.io
- Cache: Redis
- File Storage: AWS S3 or MinIO
- AI/ML: Python microservice (FastAPI)
```

#### Option 2: Python/Django
```
- Runtime: Python 3.11+
- Framework: Django + Django REST Framework
- Database: PostgreSQL 15+
- ORM: Django ORM
- Real-time: Django Channels + Redis
- Cache: Redis
- File Storage: AWS S3
- AI/ML: Integrated (scikit-learn, TensorFlow)
```

#### Option 3: Go (High Performance)
```
- Runtime: Go 1.21+
- Framework: Gin or Fiber
- Database: PostgreSQL 15+
- ORM: GORM
- Real-time: Gorilla WebSocket
- Cache: Redis
- File Storage: AWS S3
- AI/ML: Python microservice (gRPC)
```

**For this guide, we'll use Node.js/Express + PostgreSQL + Socket.io**

---

## 🗄️ Database Schema

### Complete PostgreSQL Schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('doctor', 'nurse', 'admin')),
    department VARCHAR(100),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    rating DECIMAL(3,2) DEFAULT 0.00,
    patients_handled INTEGER DEFAULT 0,
    shifts_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mrn VARCHAR(50) UNIQUE NOT NULL, -- Medical Record Number
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    blood_type VARCHAR(10),
    allergies TEXT[],
    medical_history TEXT[],
    current_medications TEXT[],
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ER Visits
CREATE TABLE er_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    arrival_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT NOT NULL,
    esi_level INTEGER CHECK (esi_level BETWEEN 1 AND 5),
    bed_number VARCHAR(20),
    attending_doctor_id UUID REFERENCES users(id),
    assigned_nurse_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_treatment', 'admitted', 'discharged', 'transferred')),
    discharge_time TIMESTAMP,
    discharge_disposition VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vital Signs
CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES er_visits(id) ON DELETE CASCADE,
    recorded_by_id UUID REFERENCES users(id),
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    heart_rate INTEGER,
    temperature DECIMAL(4,1),
    temperature_unit VARCHAR(1) CHECK (temperature_unit IN ('F', 'C')),
    oxygen_saturation INTEGER CHECK (oxygen_saturation BETWEEN 0 AND 100),
    respiratory_rate INTEGER,
    pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab Results
CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES er_visits(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_value VARCHAR(255) NOT NULL,
    test_unit VARCHAR(50),
    reference_range VARCHAR(100),
    is_critical BOOLEAN DEFAULT FALSE,
    ordered_by_id UUID REFERENCES users(id),
    resulted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Medical Imaging
CREATE TABLE medical_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES er_visits(id) ON DELETE CASCADE,
    image_type VARCHAR(50) NOT NULL, -- 'xray', 'ct', 'mri', 'ultrasound'
    body_part VARCHAR(100),
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    ai_analysis_result JSONB,
    ai_confidence_score DECIMAL(5,2),
    uploaded_by_id UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- AI Predictions
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES er_visits(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    prediction_type VARCHAR(100) NOT NULL, -- 'triage', 'diagnosis', 'sepsis_risk', 'readmission'
    prediction_result JSONB NOT NULL,
    confidence_score DECIMAL(5,2),
    input_features JSONB,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES er_visits(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('critical', 'warning', 'info', 'success')),
    priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    location VARCHAR(100),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by_id UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(100) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    generated_by_id UUID REFERENCES users(id),
    parameters JSONB,
    file_path VARCHAR(500),
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'generating' CHECK (status IN ('generating', 'complete', 'failed', 'scheduled')),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice Recordings
CREATE TABLE voice_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES er_visits(id) ON DELETE CASCADE,
    recorded_by_id UUID REFERENCES users(id),
    file_path VARCHAR(500) NOT NULL,
    duration_seconds INTEGER,
    transcript TEXT,
    transcript_confidence DECIMAL(5,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    request_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_er_visits_patient_id ON er_visits(patient_id);
CREATE INDEX idx_er_visits_status ON er_visits(status);
CREATE INDEX idx_er_visits_arrival_time ON er_visits(arrival_time);
CREATE INDEX idx_vital_signs_visit_id ON vital_signs(visit_id);
CREATE INDEX idx_vital_signs_recorded_at ON vital_signs(recorded_at);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX idx_medical_images_visit_id ON medical_images(visit_id);
CREATE INDEX idx_lab_results_visit_id ON lab_results(visit_id);
```

---

## 🏗️ API Architecture

### Project Structure:

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── s3.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Patient.ts
│   │   ├── ERVisit.ts
│   │   ├── VitalSigns.ts
│   │   └── ...
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── patients.routes.ts
│   │   ├── visits.routes.ts
│   │   ├── vitals.routes.ts
│   │   ├── alerts.routes.ts
│   │   ├── reports.routes.ts
│   │   ├── staff.routes.ts
│   │   └── admin.routes.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── patientsController.ts
│   │   ├── vitalsController.ts
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimit.ts
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── notificationService.ts
│   │   ├── reportService.ts
│   │   └── storageService.ts
│   ├── websocket/
│   │   ├── socketServer.ts
│   │   ├── handlers/
│   │   │   ├── vitalsHandler.ts
│   │   │   ├── alertsHandler.ts
│   │   │   └── queueHandler.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   ├── types/
│   │   └── index.ts
│   └── app.ts
├── tests/
├── .env
├── package.json
└── tsconfig.json
```

### Core API Endpoints:

```typescript
// Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me

// Patients
GET    /api/patients                    // List all patients
POST   /api/patients                    // Create patient
GET    /api/patients/:id                // Get patient details
PUT    /api/patients/:id                // Update patient
DELETE /api/patients/:id                // Delete patient
GET    /api/patients/:id/visits         // Get patient's visit history
GET    /api/patients/:id/vitals         // Get vital signs history

// ER Visits
GET    /api/visits                      // List active visits
POST   /api/visits                      // Create new visit
GET    /api/visits/:id                  // Get visit details
PUT    /api/visits/:id                  // Update visit
DELETE /api/visits/:id                  // Delete visit
GET    /api/visits/queue                // Get current queue status
PUT    /api/visits/:id/triage           // Update triage assessment
PUT    /api/visits/:id/assign-staff     // Assign doctor/nurse
POST   /api/visits/:id/discharge        // Discharge patient

// Vital Signs
GET    /api/vitals                      // List all vitals
POST   /api/vitals                      // Submit vital signs
GET    /api/vitals/:id                  // Get specific vital
PUT    /api/vitals/:id                  // Update vital
DELETE /api/vitals/:id                  // Delete vital

// Lab Results
GET    /api/labs                        // List lab results
POST   /api/labs                        // Submit lab result
GET    /api/labs/:id                    // Get specific lab
PUT    /api/labs/:id                    // Update lab result

// Medical Imaging
POST   /api/images/upload               // Upload X-ray/CT scan
GET    /api/images/:id                  // Get image
POST   /api/images/:id/analyze          // Run AI analysis
DELETE /api/images/:id                  // Delete image

// AI/Predictions
POST   /api/ai/predict/triage           // Get triage recommendation
POST   /api/ai/predict/sepsis           // Check sepsis risk
POST   /api/ai/predict/readmission      // Predict readmission risk
POST   /api/ai/analyze-xray             // Analyze X-ray image
GET    /api/ai/models                   // List AI models
POST   /api/ai/models/:id/retrain       // Retrain model

// Alerts
GET    /api/alerts                      // Get all alerts
POST   /api/alerts                      // Create alert
PUT    /api/alerts/:id/acknowledge      // Acknowledge alert
DELETE /api/alerts/:id                  // Dismiss alert
GET    /api/alerts/active               // Get active alerts only

// Reports
GET    /api/reports                     // List reports
POST   /api/reports/generate            // Generate report
GET    /api/reports/:id                 // Get report details
GET    /api/reports/:id/download        // Download report file
DELETE /api/reports/:id                 // Delete report

// Staff Management (Admin)
GET    /api/staff                       // List all staff
POST   /api/staff                       // Add staff member
GET    /api/staff/:id                   // Get staff details
PUT    /api/staff/:id                   // Update staff
DELETE /api/staff/:id                   // Remove staff
GET    /api/staff/:id/performance       // Get performance metrics

// Analytics (Admin)
GET    /api/analytics/patient-flow      // Patient flow data
GET    /api/analytics/department        // Department performance
GET    /api/analytics/wait-times        // Wait time statistics
GET    /api/analytics/esi-distribution  // ESI level distribution
GET    /api/analytics/ai-performance    // AI model metrics

// System (Admin)
GET    /api/system/health               // System health check
GET    /api/system/metrics              // Resource usage metrics
GET    /api/system/logs                 // System logs
POST   /api/system/diagnostics          // Run diagnostics
GET    /api/system/audit-logs           // Audit trail

// Voice Recordings
POST   /api/voice/upload                // Upload voice recording
POST   /api/voice/transcribe            // Transcribe audio
GET    /api/voice/:id                   // Get recording
```

---

## 🔐 Authentication & Authorization

### JWT-Based Authentication:

```typescript
// src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface JWTPayload {
  userId: string;
  email: string;
  role: 'doctor' | 'nurse' | 'admin';
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user as JWTPayload;
    next();
  });
};

// Role-based access control
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
```

### Usage:
```typescript
// Protect routes
router.get('/api/patients', authenticateToken, getPatientsHandler);

// Admin only
router.post('/api/staff', authenticateToken, requireRole('admin'), addStaffHandler);

// Doctor or Admin
router.post('/api/visits/:id/discharge', 
  authenticateToken, 
  requireRole('doctor', 'admin'), 
  dischargePatientHandler
);
```

---

## 🔄 Real-Time Features with Socket.io

### Socket Server Setup:

```typescript
// src/websocket/socketServer.ts
import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export function setupWebSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      
      socket.data.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user.userId}`);

    // Join department room
    socket.join(`department:${socket.data.user.department}`);

    // Subscribe to patient updates
    socket.on('subscribe:patient', (patientId) => {
      socket.join(`patient:${patientId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.userId}`);
    });
  });

  return io;
}

// Emit events from anywhere in the app
export function emitVitalUpdate(io: Server, visitId: string, vitals: any) {
  io.to(`patient:${visitId}`).emit('vitals:update', vitals);
}

export function emitNewAlert(io: Server, alert: any) {
  io.to(`department:${alert.department}`).emit('alert:new', alert);
}

export function emitQueueUpdate(io: Server, queueData: any) {
  io.emit('queue:update', queueData);
}
```

### Frontend Socket Connection:

```typescript
// Frontend: src/services/socket.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(process.env.REACT_APP_API_URL!, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('vitals:update', (data) => {
      // Update UI with new vitals
      console.log('Vitals update:', data);
    });

    this.socket.on('alert:new', (alert) => {
      // Show alert notification
      console.log('New alert:', alert);
    });

    this.socket.on('queue:update', (queue) => {
      // Update queue display
      console.log('Queue update:', queue);
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }

  subscribeToPatient(patientId: string) {
    this.socket?.emit('subscribe:patient', patientId);
  }
}

export default new SocketService();
```

---

## 🤖 AI/ML Integration

### Python Microservice (FastAPI):

```python
# ai_service/main.py
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
import tensorflow as tf
import numpy as np

app = FastAPI()

# Load pre-trained models
triage_model = tf.keras.models.load_model('models/triage_classifier.h5')
sepsis_model = tf.keras.models.load_model('models/sepsis_predictor.h5')
xray_model = tf.keras.models.load_model('models/xray_analyzer.h5')

class TriageRequest(BaseModel):
    age: int
    vitals: dict
    chief_complaint: str
    history: list

@app.post("/predict/triage")
async def predict_triage(request: TriageRequest):
    # Preprocess input
    features = preprocess_triage_data(request)
    
    # Predict ESI level
    prediction = triage_model.predict(features)
    esi_level = np.argmax(prediction) + 1
    confidence = float(np.max(prediction))
    
    return {
        "esi_level": int(esi_level),
        "confidence": confidence,
        "recommendations": get_recommendations(esi_level)
    }

@app.post("/analyze/xray")
async def analyze_xray(file: UploadFile = File(...)):
    # Read and preprocess image
    image = await file.read()
    preprocessed = preprocess_image(image)
    
    # Run prediction
    result = xray_model.predict(preprocessed)
    
    return {
        "findings": extract_findings(result),
        "bounding_boxes": get_bounding_boxes(result),
        "confidence": float(np.max(result))
    }

@app.post("/predict/sepsis")
async def predict_sepsis(vitals: dict, labs: dict):
    features = prepare_sepsis_features(vitals, labs)
    risk_score = sepsis_model.predict(features)[0][0]
    
    return {
        "risk_score": float(risk_score),
        "risk_level": "high" if risk_score > 0.7 else "medium" if risk_score > 0.4 else "low",
        "qsofa_score": calculate_qsofa(vitals)
    }
```

### Node.js Integration:

```typescript
// src/services/aiService.ts
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export class AIService {
  static async predictTriage(data: any) {
    const response = await axios.post(`${AI_SERVICE_URL}/predict/triage`, data);
    return response.data;
  }

  static async analyzeXray(filePath: string) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    const response = await axios.post(`${AI_SERVICE_URL}/analyze/xray`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  }

  static async predictSepsis(vitals: any, labs: any) {
    const response = await axios.post(`${AI_SERVICE_URL}/predict/sepsis`, {
      vitals,
      labs
    });
    
    return response.data;
  }
}
```

---

## 📦 File Storage (AWS S3)

```typescript
// src/config/s3.ts
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export async function uploadFile(file: Buffer, fileName: string, mimeType: string) {
  const params = {
    Bucket: process.env.S3_BUCKET!,
    Key: `medical-images/${Date.now()}-${fileName}`,
    Body: file,
    ContentType: mimeType,
    ACL: 'private'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}

export async function getSignedUrl(fileKey: string) {
  const params = {
    Bucket: process.env.S3_BUCKET!,
    Key: fileKey,
    Expires: 3600 // 1 hour
  };

  return s3.getSignedUrl('getObject', params);
}
```

---

## 🚀 Step-by-Step Implementation

### Step 1: Setup Project

```bash
# Create project
mkdir er-dashboard-backend
cd er-dashboard-backend
npm init -y

# Install dependencies
npm install express typescript ts-node @types/node @types/express
npm install pg pg-hstore sequelize
npm install jsonwebtoken bcrypt
npm install socket.io
npm install redis
npm install aws-sdk
npm install cors helmet morgan
npm install dotenv
npm install joi # validation

# Install dev dependencies
npm install -D nodemon @types/jsonwebtoken @types/bcrypt @types/cors
```

### Step 2: Setup Database

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE er_dashboard;
CREATE USER er_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE er_dashboard TO er_admin;
\q

# Run schema
psql -U er_admin -d er_dashboard -f schema.sql
```

### Step 3: Environment Variables

```.env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://er_admin:password@localhost:5432/er_dashboard

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=er-dashboard-images

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 4: Create Basic Server

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { setupWebSocket } from './websocket/socketServer';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// WebSocket
const io = setupWebSocket(httpServer);
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { io };
```

### Step 5: Implement Core Controllers

```typescript
// src/controllers/patientsController.ts
import { Request, Response } from 'express';
import { Patient, ERVisit } from '../models';

export async function getPatients(req: Request, res: Response) {
  try {
    const patients = await Patient.findAll({
      include: [{
        model: ERVisit,
        where: { status: 'waiting' },
        required: false
      }]
    });

    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
}

export async function createPatient(req: Request, res: Response) {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create patient' });
  }
}

// ... more controller methods
```

### Step 6: Deploy

```bash
# Using Docker
docker-compose up -d

# Or PM2 for production
npm install -g pm2
pm2 start dist/app.js --name er-backend
pm2 save
pm2 startup
```

---

## 📚 Additional Resources

### Recommended Reading:
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Authentication](https://jwt.io/introduction)

### Monitoring & Logging:
- Winston for logging
- Prometheus + Grafana for metrics
- Sentry for error tracking

### Testing:
- Jest for unit tests
- Supertest for API tests
- Artillery for load testing

---

## ✅ Implementation Checklist

- [ ] Setup PostgreSQL database
- [ ] Create database schema
- [ ] Setup Express server
- [ ] Implement authentication (JWT)
- [ ] Create API routes
- [ ] Setup WebSocket server
- [ ] Implement real-time features
- [ ] Setup file storage (S3)
- [ ] Integrate AI service
- [ ] Add validation & error handling
- [ ] Implement rate limiting
- [ ] Add logging & monitoring
- [ ] Write tests
- [ ] Setup CI/CD
- [ ] Deploy to production

---

**Your backend is now ready to power the Medical ER Triage Dashboard! 🎉**
