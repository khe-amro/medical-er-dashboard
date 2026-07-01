# 🔗 Backend Integration Map - Medical ER Dashboard

Complete mapping of every UI/UX component to backend APIs, WebSocket events, and data models.

---

## 📋 Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Dashboard Components](#dashboard-components)
3. [Patient Queue System](#patient-queue-system)
4. [Nurse Intake Portal](#nurse-intake-portal)
5. [AI Diagnostic Intelligence](#ai-diagnostic-intelligence)
6. [Admin Dashboard](#admin-dashboard)
7. [Real-Time Features](#real-time-features)
8. [Data Models](#data-models)
9. [API Endpoint Summary](#api-endpoint-summary)
10. [WebSocket Events](#websocket-events)

---

## 1. Authentication & Authorization

### UI Component: Login Screen (Not Yet Implemented)
**File**: *To be created*

#### Backend Requirements:

**API Endpoint**: `POST /api/auth/login`
```typescript
// Request
{
  "email": "doctor@hospital.com",
  "password": "securepassword"
}

// Response
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-123",
    "name": "Dr. Sarah Chen",
    "role": "doctor", // "doctor" | "nurse" | "admin"
    "department": "Emergency Medicine",
    "avatar": "https://..."
  }
}
```

**Database Table**: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'doctor', 'nurse', 'admin'
  department VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

#### Implementation in Frontend:
```typescript
// src/app/services/auth.ts
export async function login(email: string, password: string) {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}
```

---

## 2. Dashboard Components

### Component: NavigationRail.tsx
**File**: `src/app/components/NavigationRail.tsx`

#### UI Elements & Backend Mapping:

| UI Element | Backend Endpoint | Real-Time Event |
|------------|-----------------|-----------------|
| Alert Badge Count | `GET /api/alerts/unread-count` | `alert:new` |
| User Profile Avatar | `GET /api/users/me` | - |
| Active View State | Client-side only | - |

**API for Alert Count**:
```typescript
GET /api/alerts/unread-count

// Response
{
  "count": 5
}
```

**WebSocket Event for New Alerts**:
```typescript
socket.on('alert:new', (alert) => {
  // Update badge count
  setAlertCount(prev => prev + 1);
});
```

---

### Component: PatientCard.tsx
**File**: `src/app/components/PatientCard.tsx`

#### UI Elements & Backend Mapping:

| UI Element | Data Source | Update Frequency |
|------------|-------------|------------------|
| Patient Name | `patients.name` | On load |
| ESI Level Badge | `patients.esi_level` | Real-time |
| Age | Calculated from `patients.date_of_birth` | Static |
| Chief Complaint | `patients.chief_complaint` | On load |
| Wait Time | Calculated from `patients.arrival_time` | Every 1 minute |
| Vital Signs | `vital_signs` table (latest) | Every 2 seconds |

**API Endpoint**: `GET /api/patients/:id`
```typescript
GET /api/patients/pt-123

// Response
{
  "id": "pt-123",
  "name": "John Anderson",
  "age": 54,
  "gender": "Male",
  "dateOfBirth": "1971-08-15",
  "mrn": "MRN-789456",
  "esiLevel": 2,
  "chiefComplaint": "Severe chest pain radiating to left arm",
  "arrivalTime": "2026-05-03T14:23:00Z",
  "currentLocation": "Triage Bay 3",
  "assignedDoctor": "Dr. Sarah Chen",
  "assignedNurse": "RN Emily Rodriguez",
  "allergies": ["Penicillin", "Latex"],
  "vitalSigns": {
    "heartRate": 92,
    "bloodPressure": "142/88",
    "oxygenSaturation": 94,
    "respiratoryRate": 22,
    "temperature": 37.1,
    "painLevel": 8
  }
}
```

**Database Tables**:
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  esi_level INTEGER CHECK (esi_level BETWEEN 1 AND 5),
  chief_complaint TEXT,
  arrival_time TIMESTAMP NOT NULL,
  current_location VARCHAR(100),
  assigned_doctor_id UUID REFERENCES users(id),
  assigned_nurse_id UUID REFERENCES users(id),
  status VARCHAR(50), -- 'waiting', 'in_treatment', 'discharged'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  heart_rate INTEGER,
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  oxygen_saturation INTEGER,
  respiratory_rate INTEGER,
  temperature DECIMAL(4,2),
  temperature_unit VARCHAR(1), -- 'C' or 'F'
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  recorded_at TIMESTAMP DEFAULT NOW(),
  recorded_by UUID REFERENCES users(id)
);
```

**WebSocket for Real-Time Vital Updates**:
```typescript
socket.on('vitals:update', (data) => {
  if (data.patientId === currentPatientId) {
    setVitalSigns(data.vitals);
  }
});
```

---

### Component: VitalSignsMonitor.tsx
**File**: `src/app/components/VitalSignsMonitor.tsx`

#### UI Elements & Backend Mapping:

| UI Element | Backend Source | Real-Time |
|------------|---------------|-----------|
| ECG Waveform | Client-side animation | Yes |
| Heart Rate Display | `vital_signs.heart_rate` | Every 2s |
| Blood Pressure | `vital_signs.systolic_bp`, `diastolic_bp` | Every 2s |
| Oxygen Saturation | `vital_signs.oxygen_saturation` | Every 2s |
| Respiratory Rate | `vital_signs.respiratory_rate` | Every 2s |
| Trend Sparklines | Last 20 readings from `vital_signs` | Real-time |

**API for Historical Vitals**:
```typescript
GET /api/patients/:id/vitals?limit=20

// Response
{
  "patientId": "pt-123",
  "vitals": [
    {
      "timestamp": "2026-05-03T14:30:00Z",
      "heartRate": 92,
      "bloodPressure": "142/88",
      "oxygenSaturation": 94,
      "respiratoryRate": 22
    },
    // ... 19 more readings
  ]
}
```

**WebSocket Integration**:
```typescript
// In useRealTimeVitals hook
useEffect(() => {
  const socket = io('http://localhost:5000');
  
  socket.emit('subscribe:vitals', { patientId });
  
  socket.on('vitals:update', (data) => {
    setVitals(data.vitals);
  });
  
  return () => {
    socket.emit('unsubscribe:vitals', { patientId });
    socket.disconnect();
  };
}, [patientId]);
```

---

### Component: DoctorQueueTable.tsx
**File**: `src/app/components/DoctorQueueTable.tsx`

#### UI Elements & Backend Mapping:

| UI Element | Backend Source | Update Method |
|------------|---------------|---------------|
| Patient List | `GET /api/patients/queue` | WebSocket + Poll |
| ESI Level Badge | `patients.esi_level` | Real-time |
| Wait Time | Calculated from `arrival_time` | Client-side |
| Vital Trends | `vital_signs` (last 10) | Real-time |
| Sort Order | Client-side | - |

**API Endpoint**: `GET /api/patients/queue`
```typescript
GET /api/patients/queue?status=waiting&sort=esiLevel

// Response
{
  "queue": [
    {
      "id": "pt-123",
      "name": "John Anderson",
      "mrn": "MRN-789456",
      "age": 54,
      "gender": "Male",
      "esiLevel": 2,
      "chiefComplaint": "Severe chest pain",
      "arrivalTime": "2026-05-03T14:23:00Z",
      "waitTime": 45, // minutes
      "location": "Triage Bay 3",
      "vitalTrends": {
        "heartRate": [88, 90, 92, 91, 93],
        "oxygenSat": [95, 94, 94, 93, 94]
      }
    },
    // ... more patients
  ],
  "total": 12
}
```

**WebSocket for Queue Updates**:
```typescript
socket.on('queue:update', (data) => {
  // New patient added, ESI changed, or patient status updated
  setPatients(data.queue);
});
```

---

## 3. Patient Queue System

### Component: PatientStatusBadge
**Inline in multiple components**

#### Backend Mapping:

| Status | Database Value | Color | Icon |
|--------|---------------|-------|------|
| Waiting | `waiting` | Yellow | Clock |
| In Treatment | `in_treatment` | Blue | Activity |
| Discharged | `discharged` | Green | CheckCircle |
| Transferred | `transferred` | Purple | ArrowRight |

**API to Update Status**:
```typescript
PATCH /api/patients/:id/status

// Request
{
  "status": "in_treatment",
  "location": "Room 4",
  "updatedBy": "user-123"
}

// Response
{
  "id": "pt-123",
  "status": "in_treatment",
  "location": "Room 4",
  "updatedAt": "2026-05-03T15:30:00Z"
}
```

**Database Update**:
```sql
UPDATE patients 
SET status = 'in_treatment',
    current_location = 'Room 4',
    updated_at = NOW()
WHERE id = 'pt-123';

-- Log the status change
INSERT INTO patient_status_history (patient_id, status, location, changed_by)
VALUES ('pt-123', 'in_treatment', 'Room 4', 'user-123');
```

---

## 4. Nurse Intake Portal

### Component: VitalsInputForm.tsx
**File**: `src/app/components/VitalsInputForm.tsx`

#### UI Elements & Backend Mapping:

| Form Field | Database Column | Validation |
|------------|----------------|------------|
| Systolic BP | `vital_signs.systolic_bp` | 60-250 |
| Diastolic BP | `vital_signs.diastolic_bp` | 40-150 |
| Heart Rate | `vital_signs.heart_rate` | 30-200 |
| Temperature | `vital_signs.temperature` | 95-106°F |
| Oxygen Sat | `vital_signs.oxygen_saturation` | 70-100 |
| Resp Rate | `vital_signs.respiratory_rate` | 8-40 |
| Pain Level | `vital_signs.pain_level` | 0-10 |

**API Endpoint**: `POST /api/patients/:id/vitals`
```typescript
POST /api/patients/pt-123/vitals

// Request
{
  "systolicBp": 142,
  "diastolicBp": 88,
  "heartRate": 92,
  "temperature": 37.1,
  "temperatureUnit": "C",
  "oxygenSaturation": 94,
  "respiratoryRate": 22,
  "painLevel": 8,
  "recordedBy": "user-456" // Nurse ID
}

// Response
{
  "id": "vital-789",
  "patientId": "pt-123",
  "timestamp": "2026-05-03T15:45:00Z",
  "vitals": {
    "heartRate": 92,
    "bloodPressure": "142/88",
    "oxygenSaturation": 94,
    "respiratoryRate": 22,
    "temperature": 37.1,
    "painLevel": 8
  }
}
```

**WebSocket Broadcast**:
```typescript
// Backend broadcasts to all connected clients watching this patient
io.to(`patient:${patientId}`).emit('vitals:update', {
  patientId,
  vitals: newVitals,
  timestamp: new Date()
});
```

---

### Component: VoicePulseRecorder.tsx
**File**: `src/app/components/VoicePulseRecorder.tsx`

#### UI Elements & Backend Mapping:

| UI Element | Backend Service | API |
|------------|----------------|-----|
| Voice Recording | Browser MediaRecorder API | Client-side |
| Transcript | Speech-to-Text Service | `POST /api/transcribe` |
| Medical Term Highlighting | NLP Service | Client-side regex |
| Save to Notes | Patient Notes API | `POST /api/patients/:id/notes` |

**API for Transcription** (Optional - could use client-side Web Speech API):
```typescript
POST /api/transcribe

// Request (multipart/form-data)
{
  "audio": <audio file blob>,
  "language": "en-US"
}

// Response
{
  "transcript": "Patient reports severe chest pain radiating to left arm...",
  "confidence": 0.94,
  "medicalTerms": ["chest pain", "radiating", "left arm"]
}
```

**API to Save Transcript**:
```typescript
POST /api/patients/:id/notes

// Request
{
  "type": "voice_note",
  "content": "Patient reports severe chest pain radiating to left arm...",
  "recordedBy": "user-456",
  "timestamp": "2026-05-03T15:50:00Z"
}

// Response
{
  "noteId": "note-123",
  "patientId": "pt-123",
  "saved": true
}
```

**Database Table**:
```sql
CREATE TABLE patient_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  note_type VARCHAR(50), -- 'voice_note', 'text_note', 'discharge_summary'
  content TEXT NOT NULL,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Component: XRayDropzone.tsx
**File**: `src/app/components/XRayDropzone.tsx`

#### UI Elements & Backend Mapping:

| UI Element | Backend Service | API Endpoint |
|------------|----------------|--------------|
| File Upload | File Storage (MinIO) | `POST /api/upload` |
| AI Analysis | Python AI Service | `POST /api/ai/analyze/xray` |
| Progress Bar | Client-side | - |
| Results Display | From AI response | - |

**API for File Upload**:
```typescript
POST /api/upload

// Request (multipart/form-data)
{
  "file": <image file>,
  "patientId": "pt-123",
  "type": "xray",
  "bodyPart": "chest"
}

// Response
{
  "fileId": "file-123",
  "url": "http://localhost:9000/medical-images/pt-123/chest-xray-2026-05-03.jpg",
  "uploadedAt": "2026-05-03T16:00:00Z"
}
```

**API for AI Analysis** (Connects to Python AI Service):
```typescript
POST /api/ai/analyze/xray

// Request
{
  "fileId": "file-123",
  "imageUrl": "http://localhost:9000/...",
  "patientId": "pt-123"
}

// Response (from AI service)
{
  "findings": [
    {
      "condition": "Pleural Effusion",
      "location": "Left lower lobe",
      "confidence": 0.84,
      "severity": "moderate"
    },
    {
      "condition": "Cardiomegaly",
      "location": "Cardiac silhouette",
      "confidence": 0.76,
      "severity": "mild"
    }
  ],
  "boundingBoxes": [
    {"x": 90, "y": 190, "width": 100, "height": 80, "label": "Pleural Effusion"}
  ],
  "overallConfidence": 0.84,
  "normal": false
}
```

**Database Table**:
```sql
CREATE TABLE medical_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  image_type VARCHAR(50), -- 'xray', 'ct_scan', 'mri'
  body_part VARCHAR(50),
  file_url TEXT NOT NULL,
  ai_analysis JSONB, -- Store AI findings
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. AI Diagnostic Intelligence

### Component: AIDiagnosticInsights.tsx
**File**: `src/app/components/AIDiagnosticInsights.tsx`

#### UI Elements & Backend Mapping:

| AI Feature | Python AI Endpoint | Data Source |
|------------|-------------------|-------------|
| Triage Prediction | `POST /predict/triage` | Patient vitals + complaint |
| Sepsis Risk | `POST /predict/sepsis` | Vitals + lab results |
| Readmission Risk | `POST /predict/readmission` | Patient history |
| Differential Diagnosis | `POST /predict/diagnosis` | All patient data |

**Triage AI Prediction**:
```typescript
POST http://localhost:8000/predict/triage

// Request
{
  "age": 54,
  "gender": "Male",
  "chiefComplaint": "Severe chest pain radiating to left arm",
  "vitals": {
    "heart_rate": 92,
    "oxygen_saturation": 94,
    "systolic_bp": 142,
    "respiratory_rate": 22
  },
  "history": ["Hypertension", "Type 2 Diabetes"]
}

// Response
{
  "esiLevel": 2,
  "confidence": 0.92,
  "reasoning": "Critical chest pain symptoms with elevated heart rate suggest emergent condition",
  "recommendations": [
    "Immediate assessment required",
    "Monitor vital signs continuously",
    "Prepare for cardiac workup"
  ]
}
```

**Sepsis Risk Prediction**:
```typescript
POST http://localhost:8000/predict/sepsis

// Request
{
  "vitals": {
    "systolic_bp": 95,
    "respiratory_rate": 24,
    "temperature": 38.9
  },
  "labs": {
    "lactate": 2.4,
    "wbc": 15000,
    "crp": 120
  }
}

// Response
{
  "riskScore": 0.78,
  "riskLevel": "high",
  "qsofaScore": 2,
  "recommendations": [
    "Immediate sepsis protocol activation",
    "Order blood cultures and start broad-spectrum antibiotics",
    "IV fluid resuscitation"
  ]
}
```

**Frontend Integration**:
```typescript
// src/app/services/aiService.ts
export async function getPredictions(patientId: string) {
  const patient = await fetchPatient(patientId);
  const vitals = await fetchLatestVitals(patientId);
  const labs = await fetchLatestLabs(patientId);
  
  const [triageResult, sepsisResult] = await Promise.all([
    fetch('http://localhost:8000/predict/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age: patient.age,
        gender: patient.gender,
        chiefComplaint: patient.chiefComplaint,
        vitals: vitals,
        history: patient.medicalHistory
      })
    }),
    fetch('http://localhost:8000/predict/sepsis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vitals: vitals,
        labs: labs
      })
    })
  ]);
  
  return {
    triage: await triageResult.json(),
    sepsis: await sepsisResult.json()
  };
}
```

---

## 6. Admin Dashboard

### Component: AdminDashboard.tsx
**File**: `src/app/components/AdminDashboard.tsx`

#### Tab 1: Overview (Analytics)

| Chart Component | Backend API | Data Aggregation |
|----------------|-------------|------------------|
| Patient Volume (Line Chart) | `GET /api/analytics/patient-volume` | Daily/hourly counts |
| ESI Distribution (Pie Chart) | `GET /api/analytics/esi-distribution` | Current queue grouping |
| Bed Occupancy (Bar Chart) | `GET /api/analytics/bed-occupancy` | Real-time status |
| Wait Time Trends (Area Chart) | `GET /api/analytics/wait-times` | Hourly averages |

**API for Patient Volume**:
```typescript
GET /api/analytics/patient-volume?period=24h&interval=1h

// Response
{
  "period": "24h",
  "data": [
    { "hour": "2026-05-03T00:00:00Z", "count": 12 },
    { "hour": "2026-05-03T01:00:00Z", "count": 8 },
    { "hour": "2026-05-03T02:00:00Z", "count": 5 },
    // ... 21 more hours
  ]
}
```

**SQL Query**:
```sql
SELECT 
  DATE_TRUNC('hour', arrival_time) as hour,
  COUNT(*) as count
FROM patients
WHERE arrival_time >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', arrival_time)
ORDER BY hour;
```

**API for ESI Distribution**:
```typescript
GET /api/analytics/esi-distribution

// Response
{
  "distribution": [
    { "esiLevel": 1, "count": 2, "percentage": 8.3 },
    { "esiLevel": 2, "count": 5, "percentage": 20.8 },
    { "esiLevel": 3, "count": 10, "percentage": 41.7 },
    { "esiLevel": 4, "count": 6, "percentage": 25.0 },
    { "esiLevel": 5, "count": 1, "percentage": 4.2 }
  ],
  "total": 24
}
```

---

#### Tab 2: Staff Management

| UI Action | Backend API | HTTP Method |
|-----------|-------------|-------------|
| List All Staff | `GET /api/staff` | GET |
| Add New Staff | `POST /api/staff` | POST |
| Edit Staff | `PATCH /api/staff/:id` | PATCH |
| Delete Staff | `DELETE /api/staff/:id` | DELETE |
| Filter by Role | `GET /api/staff?role=doctor` | GET |

**API for Staff Management**:
```typescript
// GET /api/staff
{
  "staff": [
    {
      "id": "user-123",
      "name": "Dr. Sarah Chen",
      "role": "doctor",
      "department": "Emergency Medicine",
      "shift": "Day Shift (7AM-7PM)",
      "status": "on-duty",
      "patientsAssigned": 5,
      "email": "sarah.chen@hospital.com",
      "phone": "+1-555-0123"
    },
    // ... more staff
  ]
}

// POST /api/staff
// Request
{
  "name": "Dr. Michael Roberts",
  "email": "michael.roberts@hospital.com",
  "password": "tempPassword123",
  "role": "doctor",
  "department": "Emergency Medicine",
  "shift": "Night Shift (7PM-7AM)"
}

// Response
{
  "id": "user-456",
  "name": "Dr. Michael Roberts",
  "created": true
}

// PATCH /api/staff/user-456
// Request
{
  "shift": "Day Shift (7AM-7PM)",
  "status": "on-leave"
}

// DELETE /api/staff/user-456
// Response
{
  "deleted": true
}
```

**Database Query**:
```sql
-- Get staff with patient counts
SELECT 
  u.id,
  u.name,
  u.role,
  u.department,
  s.shift_type,
  s.status,
  COUNT(p.id) as patients_assigned
FROM users u
LEFT JOIN staff_schedule s ON u.id = s.user_id AND s.date = CURRENT_DATE
LEFT JOIN patients p ON (
  (u.role = 'doctor' AND p.assigned_doctor_id = u.id) OR
  (u.role = 'nurse' AND p.assigned_nurse_id = u.id)
)
WHERE u.role IN ('doctor', 'nurse')
GROUP BY u.id, u.name, u.role, u.department, s.shift_type, s.status;
```

---

#### Tab 3: Patient Management

| UI Feature | Backend API | Purpose |
|------------|-------------|---------|
| Search Patients | `GET /api/patients/search?q=john` | Find by name/MRN |
| Patient History | `GET /api/patients/:id/history` | Full medical timeline |
| Discharge Patient | `PATCH /api/patients/:id/discharge` | Update status |
| Transfer Patient | `POST /api/patients/:id/transfer` | Change location |

**API for Patient Search**:
```typescript
GET /api/patients/search?q=Anderson&status=all&limit=50

// Response
{
  "results": [
    {
      "id": "pt-123",
      "name": "John Anderson",
      "mrn": "MRN-789456",
      "dateOfBirth": "1971-08-15",
      "status": "in_treatment",
      "lastVisit": "2026-05-03T14:23:00Z"
    },
    {
      "id": "pt-456",
      "name": "Lisa Anderson",
      "mrn": "MRN-654321",
      "dateOfBirth": "1985-03-22",
      "status": "discharged",
      "lastVisit": "2026-05-01T09:15:00Z"
    }
  ],
  "total": 2
}
```

**API for Patient History**:
```typescript
GET /api/patients/:id/history

// Response
{
  "patientId": "pt-123",
  "visits": [
    {
      "visitId": "visit-789",
      "arrivalTime": "2026-05-03T14:23:00Z",
      "chiefComplaint": "Chest pain",
      "diagnosis": "Acute myocardial infarction",
      "treatment": "Cardiac catheterization",
      "dischargeTime": null,
      "vitals": [...],
      "labs": [...],
      "imaging": [...]
    },
    // ... previous visits
  ]
}
```

---

#### Tab 4: Analytics

| Chart Type | Data Source | Real-Time |
|------------|-------------|-----------|
| Average Wait Time | `analytics_metrics` table | Every 5 min |
| Patient Outcomes | `patient_outcomes` table | Daily |
| Department Performance | `staff_metrics` table | Daily |
| AI Model Accuracy | `ai_predictions` table | Weekly |

**Database Table for Analytics**:
```sql
CREATE TABLE analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(100), -- 'wait_time', 'length_of_stay', 'patient_volume'
  metric_value DECIMAL(10,2),
  time_period TIMESTAMP,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert hourly metrics
INSERT INTO analytics_metrics (metric_type, metric_value, time_period, department)
SELECT 
  'avg_wait_time',
  AVG(EXTRACT(EPOCH FROM (treatment_start_time - arrival_time))/60) as avg_minutes,
  DATE_TRUNC('hour', arrival_time),
  'Emergency'
FROM patients
WHERE arrival_time >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', arrival_time);
```

---

#### Tab 5: System Settings

| Setting Category | Storage | API |
|-----------------|---------|-----|
| User Preferences | `user_settings` table | `PATCH /api/settings/user` |
| System Config | `system_config` table | `PATCH /api/settings/system` |
| Integration Keys | Encrypted in DB | `PATCH /api/settings/integrations` |

**Database Table**:
```sql
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  notifications_enabled BOOLEAN DEFAULT true,
  email_alerts BOOLEAN DEFAULT true,
  sms_alerts BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE system_config (
  config_key VARCHAR(100) PRIMARY KEY,
  config_value TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### Component: ReportsCenter.tsx
**File**: `src/app/components/ReportsCenter.tsx`

#### UI Elements & Backend Mapping:

| Report Type | Backend API | Format Options |
|------------|-------------|----------------|
| Shift Summary | `GET /api/reports/shift` | PDF, CSV |
| Patient Volume | `GET /api/reports/patient-volume` | PDF, XLSX |
| Quality Metrics | `GET /api/reports/quality` | PDF, CSV |
| Financial Summary | `GET /api/reports/financial` | PDF, XLSX |

**API for Report Generation**:
```typescript
POST /api/reports/generate

// Request
{
  "reportType": "shift_summary",
  "dateRange": {
    "start": "2026-05-03T07:00:00Z",
    "end": "2026-05-03T19:00:00Z"
  },
  "format": "pdf",
  "includeCharts": true
}

// Response
{
  "reportId": "report-123",
  "status": "generating",
  "estimatedTime": 30 // seconds
}

// Check status
GET /api/reports/report-123/status

// Response when ready
{
  "reportId": "report-123",
  "status": "ready",
  "downloadUrl": "http://localhost:5000/downloads/report-123.pdf",
  "generatedAt": "2026-05-03T20:15:00Z"
}
```

---

### Component: AlertManagement.tsx
**File**: `src/app/components/AlertManagement.tsx`

#### UI Elements & Backend Mapping:

| Alert Type | Trigger | Backend Event |
|------------|---------|---------------|
| Critical Vitals | HR > 140 or SpO2 < 85 | `alert:critical_vitals` |
| ESI Level Change | Patient deterioration | `alert:esi_change` |
| Medication Due | Time-based | `alert:medication` |
| Lab Results | Critical values | `alert:lab_critical` |

**API for Alerts**:
```typescript
GET /api/alerts?status=unacknowledged&limit=20

// Response
{
  "alerts": [
    {
      "id": "alert-123",
      "type": "critical_vitals",
      "severity": "high",
      "patient": {
        "id": "pt-123",
        "name": "John Anderson",
        "location": "Room 4"
      },
      "message": "Heart rate elevated to 145 bpm",
      "createdAt": "2026-05-03T16:45:00Z",
      "acknowledged": false
    },
    // ... more alerts
  ]
}

// Acknowledge alert
PATCH /api/alerts/:id/acknowledge

// Request
{
  "acknowledgedBy": "user-123",
  "note": "Reviewed and notified attending physician"
}
```

**WebSocket for Real-Time Alerts**:
```typescript
// Backend triggers alert
io.emit('alert:new', {
  id: 'alert-124',
  type: 'critical_vitals',
  severity: 'high',
  patientId: 'pt-123',
  message: 'Oxygen saturation dropped to 82%'
});

// Frontend listens
socket.on('alert:new', (alert) => {
  setAlerts(prev => [alert, ...prev]);
  playAlertSound();
  showNotification(alert);
});
```

**Database Table**:
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50),
  severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  patient_id UUID REFERENCES patients(id),
  message TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. Real-Time Features

### WebSocket Connection Architecture

**Frontend Setup**:
```typescript
// src/app/services/websocket.ts
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  
  connect(userId: string) {
    this.socket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('authToken')
      }
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    
    return this.socket;
  }
  
  subscribeToPatient(patientId: string) {
    this.socket?.emit('subscribe:patient', { patientId });
  }
  
  unsubscribeFromPatient(patientId: string) {
    this.socket?.emit('unsubscribe:patient', { patientId });
  }
  
  disconnect() {
    this.socket?.disconnect();
  }
}

export const wsService = new WebSocketService();
```

**Backend Setup** (Node.js + Socket.io):
```typescript
// backend/src/websocket.ts
import { Server } from 'socket.io';
import { verifyJWT } from './auth';

export function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true
    }
  });
  
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const user = verifyJWT(token);
      socket.data.userId = user.id;
      socket.data.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.data.userId);
    
    socket.on('subscribe:patient', ({ patientId }) => {
      socket.join(`patient:${patientId}`);
    });
    
    socket.on('subscribe:vitals', ({ patientId }) => {
      socket.join(`vitals:${patientId}`);
      // Start sending real-time vital updates
      startVitalsStream(socket, patientId);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.data.userId);
    });
  });
  
  return io;
}

function startVitalsStream(socket, patientId) {
  const interval = setInterval(async () => {
    const latestVitals = await getLatestVitals(patientId);
    socket.emit('vitals:update', {
      patientId,
      vitals: latestVitals,
      timestamp: new Date()
    });
  }, 2000); // Every 2 seconds
  
  socket.on('unsubscribe:vitals', () => {
    clearInterval(interval);
  });
}
```

### Real-Time Events Reference

| Event Name | Direction | Data Structure | Use Case |
|------------|-----------|----------------|----------|
| `vitals:update` | Server → Client | `{ patientId, vitals, timestamp }` | Live vital signs |
| `queue:update` | Server → Client | `{ queue: Patient[] }` | Queue changes |
| `alert:new` | Server → Client | `{ id, type, severity, message }` | New alert |
| `patient:status_change` | Server → Client | `{ patientId, status, location }` | Status update |
| `subscribe:patient` | Client → Server | `{ patientId }` | Join patient room |
| `unsubscribe:patient` | Client → Server | `{ patientId }` | Leave patient room |

---

## 8. Data Models

### Complete TypeScript Interfaces

```typescript
// src/app/types/models.ts

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  esiLevel: 1 | 2 | 3 | 4 | 5;
  chiefComplaint: string;
  arrivalTime: string;
  currentLocation: string;
  assignedDoctor?: string;
  assignedNurse?: string;
  status: 'waiting' | 'in_treatment' | 'discharged' | 'transferred';
  allergies: string[];
  medicalHistory: string[];
  vitalSigns?: VitalSigns;
}

export interface VitalSigns {
  heartRate: number;
  bloodPressure: string; // "120/80"
  systolicBp: number;
  diastolicBp: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  temperature: number;
  temperatureUnit: 'C' | 'F';
  painLevel: number; // 0-10
  recordedAt: string;
  recordedBy?: string;
}

export interface Alert {
  id: string;
  type: 'critical_vitals' | 'esi_change' | 'medication' | 'lab_critical' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  patient?: {
    id: string;
    name: string;
    location: string;
  };
  message: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'nurse' | 'admin' | 'technician';
  department: string;
  shift: string;
  status: 'on-duty' | 'off-duty' | 'on-leave';
  patientsAssigned: number;
  phone?: string;
  avatar?: string;
}

export interface AIPrediction {
  type: 'triage' | 'sepsis' | 'readmission' | 'diagnosis';
  confidence: number;
  result: any;
  reasoning: string;
  recommendations: string[];
  timestamp: string;
}

export interface MedicalImage {
  id: string;
  patientId: string;
  imageType: 'xray' | 'ct_scan' | 'mri' | 'ultrasound';
  bodyPart: string;
  fileUrl: string;
  aiAnalysis?: {
    findings: Array<{
      condition: string;
      location: string;
      confidence: number;
      severity: string;
    }>;
    normal: boolean;
  };
  uploadedAt: string;
  uploadedBy: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testType: string;
  testName: string;
  value: number | string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  orderedAt: string;
  resultedAt: string;
  orderedBy: string;
}
```

---

## 9. API Endpoint Summary

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create new patient (registration)
- `PATCH /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/queue` - Get current queue
- `GET /api/patients/search` - Search patients
- `GET /api/patients/:id/history` - Patient visit history
- `PATCH /api/patients/:id/status` - Update patient status
- `PATCH /api/patients/:id/discharge` - Discharge patient
- `POST /api/patients/:id/transfer` - Transfer patient

### Vital Signs
- `GET /api/patients/:id/vitals` - Get vital signs history
- `POST /api/patients/:id/vitals` - Record new vitals
- `GET /api/vitals/latest/:patientId` - Get latest vitals

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/unread-count` - Get unread count
- `POST /api/alerts` - Create alert (system use)
- `PATCH /api/alerts/:id/acknowledge` - Acknowledge alert
- `DELETE /api/alerts/:id` - Dismiss alert

### Staff
- `GET /api/staff` - List all staff
- `POST /api/staff` - Add new staff
- `PATCH /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Remove staff
- `GET /api/staff/:id/schedule` - Get staff schedule

### Analytics
- `GET /api/analytics/patient-volume` - Patient volume over time
- `GET /api/analytics/esi-distribution` - ESI level distribution
- `GET /api/analytics/wait-times` - Wait time trends
- `GET /api/analytics/bed-occupancy` - Bed occupancy status
- `GET /api/analytics/outcomes` - Patient outcomes
- `GET /api/analytics/performance` - Department performance

### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/:id/status` - Check report status
- `GET /api/reports/:id/download` - Download report
- `GET /api/reports` - List available reports

### Medical Images
- `POST /api/upload` - Upload medical image
- `GET /api/images/:id` - Get image details
- `GET /api/patients/:id/images` - Get patient images

### AI Services (Proxy to Python service)
- `POST /api/ai/predict/triage` - Triage prediction
- `POST /api/ai/predict/sepsis` - Sepsis risk
- `POST /api/ai/analyze/xray` - X-ray analysis
- `POST /api/ai/predict/readmission` - Readmission risk
- `GET /api/ai/models` - List AI models

### Notes
- `GET /api/patients/:id/notes` - Get patient notes
- `POST /api/patients/:id/notes` - Add note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Settings
- `GET /api/settings/user` - Get user settings
- `PATCH /api/settings/user` - Update user settings
- `GET /api/settings/system` - Get system config (admin only)
- `PATCH /api/settings/system` - Update system config (admin only)

---

## 10. WebSocket Events

### Client → Server Events
- `subscribe:patient` - Subscribe to patient updates
- `unsubscribe:patient` - Unsubscribe from patient
- `subscribe:vitals` - Subscribe to vital signs stream
- `unsubscribe:vitals` - Unsubscribe from vitals
- `subscribe:queue` - Subscribe to queue updates
- `subscribe:alerts` - Subscribe to alert feed

### Server → Client Events
- `vitals:update` - Real-time vital signs update
- `queue:update` - Queue state changed
- `alert:new` - New alert created
- `patient:status_change` - Patient status updated
- `patient:esi_change` - ESI level changed
- `patient:assigned` - Patient assigned to staff
- `system:notification` - System message

---

## 11. Environment Configuration

### Frontend `.env`
```bash
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_MINIO_URL=http://localhost:9000
```

### Backend `.env`
```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://er_admin:er_password_123@localhost:5432/er_dashboard
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

---

## 12. Implementation Checklist

### Phase 1: Core Backend Setup ✅
- [ ] Setup PostgreSQL database with all tables
- [ ] Implement JWT authentication
- [ ] Create patient CRUD endpoints
- [ ] Create vital signs endpoints
- [ ] Setup WebSocket server

### Phase 2: Real-Time Features ✅
- [ ] Implement vital signs streaming
- [ ] Implement queue updates
- [ ] Implement alert system
- [ ] Test WebSocket connections

### Phase 3: AI Integration ✅
- [ ] Setup Python AI service
- [ ] Implement triage prediction
- [ ] Implement sepsis detection
- [ ] Connect AI endpoints to backend

### Phase 4: Admin Features ✅
- [ ] Staff management endpoints
- [ ] Analytics endpoints
- [ ] Report generation
- [ ] System settings

### Phase 5: File Management ✅
- [ ] Setup MinIO for file storage
- [ ] Image upload endpoints
- [ ] AI image analysis integration

### Phase 6: Frontend Integration ✅
- [ ] Connect all components to real APIs
- [ ] Replace mock data with API calls
- [ ] Implement WebSocket connections
- [ ] Add error handling and loading states

---

## 13. Quick Start Integration Guide

### Step 1: Start Backend Services
```bash
cd backend-quickstart
docker-compose up -d
```

### Step 2: Update Frontend API Configuration
```typescript
// src/app/config.ts
export const API_CONFIG = {
  baseUrl: 'http://localhost:5000/api',
  wsUrl: 'ws://localhost:5000',
  aiServiceUrl: 'http://localhost:8000'
};
```

### Step 3: Create API Service
```typescript
// src/app/services/api.ts
const BASE_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

export const api = {
  patients: {
    getQueue: () => apiRequest('/patients/queue'),
    getById: (id: string) => apiRequest(`/patients/${id}`),
    updateStatus: (id: string, status: string) => 
      apiRequest(`/patients/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
  },
  vitals: {
    create: (patientId: string, vitals: any) =>
      apiRequest(`/patients/${patientId}/vitals`, {
        method: 'POST',
        body: JSON.stringify(vitals)
      }),
    getHistory: (patientId: string) =>
      apiRequest(`/patients/${patientId}/vitals`)
  },
  alerts: {
    getAll: () => apiRequest('/alerts'),
    acknowledge: (id: string) =>
      apiRequest(`/alerts/${id}/acknowledge`, { method: 'PATCH' })
  }
};
```

### Step 4: Replace Mock Data
```typescript
// In DoctorQueueTable.tsx - BEFORE
const [patients, setPatients] = useState(mockPatients);

// AFTER
const [patients, setPatients] = useState<Patient[]>([]);

useEffect(() => {
  async function loadQueue() {
    const data = await api.patients.getQueue();
    setPatients(data.queue);
  }
  loadQueue();
}, []);
```

---

## 🎯 Next Steps

1. **Start Backend**: Run `docker-compose up -d` in `backend-quickstart/`
2. **Test APIs**: Use Postman or curl to test endpoints
3. **Connect Frontend**: Replace mock data with API calls
4. **Setup WebSocket**: Implement real-time connections
5. **Test End-to-End**: Verify all features work with real backend

---

**Documentation Complete** ✅  
All UI/UX elements are now mapped to backend requirements!
