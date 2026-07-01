-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & Authentication
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS patients (
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
CREATE TABLE IF NOT EXISTS er_visits (
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
CREATE TABLE IF NOT EXISTS vital_signs (
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
CREATE TABLE IF NOT EXISTS lab_results (
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
CREATE TABLE IF NOT EXISTS medical_images (
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
CREATE TABLE IF NOT EXISTS ai_predictions (
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
CREATE TABLE IF NOT EXISTS alerts (
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
CREATE TABLE IF NOT EXISTS reports (
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
CREATE TABLE IF NOT EXISTS voice_recordings (
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
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- Patient Notes (voice transcriptions, text notes)
CREATE TABLE IF NOT EXISTS patient_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES er_visits(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'text_note' CHECK (note_type IN ('voice_note', 'text_note', 'discharge_summary', 'clinical_note')),
    content TEXT NOT NULL,
    recorded_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Settings (preferences, notifications)
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Eastern Time (ET)',
    font_size VARCHAR(20) DEFAULT 'medium',
    dashboard_density VARCHAR(20) DEFAULT 'comfortable',
    high_contrast BOOLEAN DEFAULT FALSE,
    reduce_motion BOOLEAN DEFAULT FALSE,
    theme VARCHAR(20) DEFAULT 'light',
    -- Notification preferences
    notif_critical_alerts BOOLEAN DEFAULT TRUE,
    notif_lab_results BOOLEAN DEFAULT TRUE,
    notif_patient_assignments BOOLEAN DEFAULT TRUE,
    notif_bed_availability BOOLEAN DEFAULT FALSE,
    notif_shift_reminders BOOLEAN DEFAULT TRUE,
    notif_system_maintenance BOOLEAN DEFAULT FALSE,
    -- Notification channels
    channel_in_app BOOLEAN DEFAULT TRUE,
    channel_email BOOLEAN DEFAULT TRUE,
    channel_sms BOOLEAN DEFAULT FALSE,
    channel_push BOOLEAN DEFAULT TRUE,
    channel_desktop BOOLEAN DEFAULT TRUE,
    channel_pager BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patient Status History (audit trail)
CREATE TABLE IF NOT EXISTS patient_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES er_visits(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    previous_location VARCHAR(100),
    new_location VARCHAR(100),
    changed_by_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_er_visits_patient_id ON er_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_er_visits_status ON er_visits(status);
CREATE INDEX IF NOT EXISTS idx_er_visits_arrival_time ON er_visits(arrival_time);
CREATE INDEX IF NOT EXISTS idx_vital_signs_visit_id ON vital_signs(visit_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_recorded_at ON vital_signs(recorded_at);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_medical_images_visit_id ON medical_images(visit_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_visit_id ON lab_results(visit_id);
