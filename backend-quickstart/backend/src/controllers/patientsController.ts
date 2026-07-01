import { Request, Response } from 'express';
import pool from '../config/database';

export const getPatients = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM patients ORDER BY created_at DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, 
        EXTRACT(YEAR FROM AGE(p.date_of_birth))::int as age
       FROM patients p WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  const { mrn, first_name, last_name, date_of_birth, gender, blood_type, allergies, medical_history, current_medications, emergency_contact_name, emergency_contact_phone } = req.body;
  try {
    if (!mrn || !first_name || !last_name || !date_of_birth) {
      return res.status(400).json({ error: 'Missing required fields (mrn, first_name, last_name, date_of_birth)' });
    }
    const result = await pool.query(
      `INSERT INTO patients (mrn, first_name, last_name, date_of_birth, gender, blood_type, allergies, medical_history, current_medications, emergency_contact_name, emergency_contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [mrn, first_name, last_name, date_of_birth, gender, blood_type, allergies || [], medical_history || [], current_medications || [], emergency_contact_name, emergency_contact_phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'Patient with this MRN already exists' });
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const check = await pool.query('SELECT id FROM patients WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });

    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    if (!setClause) return res.status(400).json({ error: 'No fields provided to update' });

    const result = await pool.query(
      `UPDATE patients SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient deleted' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---- QUEUE: Returns patients with active visits, vitals trends, wait times ----
export const getQueue = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT v.id as visit_id, v.patient_id, v.arrival_time, v.chief_complaint, v.esi_level, v.bed_number, v.status, v.notes,
              p.first_name, p.last_name, p.mrn, p.gender, p.date_of_birth,
              EXTRACT(YEAR FROM AGE(p.date_of_birth))::int as age,
              EXTRACT(EPOCH FROM (NOW() - v.arrival_time))::int / 60 as wait_minutes,
              doc.full_name as doctor_name,
              nurse.full_name as nurse_name
       FROM er_visits v
       JOIN patients p ON v.patient_id = p.id
       LEFT JOIN users doc ON v.attending_doctor_id = doc.id
       LEFT JOIN users nurse ON v.assigned_nurse_id = nurse.id
       WHERE v.status IN ('waiting', 'in_treatment')
       ORDER BY v.esi_level ASC NULLS LAST, v.arrival_time ASC
       LIMIT 50`
    );

    // Fetch latest vitals for each visit
    const queue = await Promise.all(result.rows.map(async (row: any) => {
      const vitalsResult = await pool.query(
        `SELECT heart_rate, oxygen_saturation, systolic_bp, diastolic_bp, respiratory_rate, temperature, pain_level, recorded_at
         FROM vital_signs WHERE visit_id = $1 ORDER BY recorded_at DESC LIMIT 10`,
        [row.visit_id]
      );

      const vitals = vitalsResult.rows;
      const hrTrend = vitals.map((v: any) => v.heart_rate || 80).reverse();
      const spo2Trend = vitals.map((v: any) => v.oxygen_saturation || 98).reverse();

      // Pad trends to at least 5 points
      while (hrTrend.length < 5) hrTrend.unshift(hrTrend[0] || 80);
      while (spo2Trend.length < 5) spo2Trend.unshift(spo2Trend[0] || 98);

      const latestVitals = vitals[0] || {};

      return {
        id: row.patient_id,
        visit_id: row.visit_id,
        name: `${row.first_name} ${row.last_name}`,
        mrn: row.mrn,
        age: row.age || 0,
        gender: row.gender || 'unknown',
        chiefComplaint: row.chief_complaint || 'No complaint recorded',
        esiLevel: row.esi_level || 3,
        arrivalTime: new Date(row.arrival_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        bedNumber: row.bed_number || 'Waiting Room',
        status: row.status,
        waitTimeMinutes: row.wait_minutes || 0,
        hrTrend: hrTrend.slice(-5),
        spo2Trend: spo2Trend.slice(-5),
        aiTriage: `ESI-${row.esi_level || 3}`,
        topDifferential: row.notes || 'Pending Assessment',
        doctorName: row.doctor_name,
        nurseName: row.nurse_name,
        vitals: {
          hr: latestVitals.heart_rate || 0,
          bp: latestVitals.systolic_bp && latestVitals.diastolic_bp ? `${latestVitals.systolic_bp}/${latestVitals.diastolic_bp}` : '--/--',
          spo2: latestVitals.oxygen_saturation || 0,
          rr: latestVitals.respiratory_rate || 0,
          temp: latestVitals.temperature || 0,
          pain: latestVitals.pain_level || 0
        }
      };
    }));

    res.json({ queue, total: queue.length });
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---- SEARCH ----
export const searchPatients = async (req: Request, res: Response) => {
  const { q, status, limit } = req.query;
  try {
    const searchTerm = `%${q || ''}%`;
    const maxResults = parseInt(limit as string) || 50;

    const result = await pool.query(
      `SELECT p.*, EXTRACT(YEAR FROM AGE(p.date_of_birth))::int as age,
              v.status as visit_status, v.arrival_time as last_visit
       FROM patients p
       LEFT JOIN LATERAL (SELECT status, arrival_time FROM er_visits WHERE patient_id = p.id ORDER BY arrival_time DESC LIMIT 1) v ON true
       WHERE (p.first_name ILIKE $1 OR p.last_name ILIKE $1 OR p.mrn ILIKE $1 OR CONCAT(p.first_name, ' ', p.last_name) ILIKE $1)
       ORDER BY p.created_at DESC LIMIT $2`,
      [searchTerm, maxResults]
    );
    res.json({ results: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---- PATIENT HISTORY ----
export const getPatientHistory = async (req: Request, res: Response) => {
  try {
    const visits = await pool.query(
      `SELECT v.*, doc.full_name as doctor_name, nurse.full_name as nurse_name
       FROM er_visits v
       LEFT JOIN users doc ON v.attending_doctor_id = doc.id
       LEFT JOIN users nurse ON v.assigned_nurse_id = nurse.id
       WHERE v.patient_id = $1
       ORDER BY v.arrival_time DESC`,
      [req.params.id]
    );
    res.json({ patientId: req.params.id, visits: visits.rows });
  } catch (error) {
    console.error('Error fetching patient history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---- PATIENT VITALS (across all visits) ----
export const getPatientVitals = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  try {
    const result = await pool.query(
      `SELECT vs.*, v.patient_id
       FROM vital_signs vs
       JOIN er_visits v ON vs.visit_id = v.id
       WHERE v.patient_id = $1
       ORDER BY vs.recorded_at DESC LIMIT $2`,
      [req.params.id, limit]
    );
    res.json({ patientId: req.params.id, vitals: result.rows });
  } catch (error) {
    console.error('Error fetching patient vitals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---- PATIENT NOTES ----
export const getPatientNotes = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT pn.*, u.full_name as recorded_by_name
       FROM patient_notes pn
       LEFT JOIN users u ON pn.recorded_by_id = u.id
       WHERE pn.patient_id = $1
       ORDER BY pn.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patient notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPatientNote = async (req: Request, res: Response) => {
  const { visit_id, note_type, content } = req.body;
  const patientId = req.params.id;
  const userId = req.user?.userId;

  try {
    if (!content) return res.status(400).json({ error: 'content is required' });

    const result = await pool.query(
      `INSERT INTO patient_notes (patient_id, visit_id, note_type, content, recorded_by_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patientId, visit_id || null, note_type || 'text_note', content, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating patient note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---- STATUS UPDATES ----
export const updatePatientStatus = async (req: Request, res: Response) => {
  const { visit_id, status, location, notes } = req.body;
  const userId = req.user?.userId;

  try {
    // Find the active visit
    let visitId = visit_id;
    if (!visitId) {
      const visitResult = await pool.query(
        `SELECT id, status, bed_number FROM er_visits WHERE patient_id = $1 AND status IN ('waiting', 'in_treatment') ORDER BY arrival_time DESC LIMIT 1`,
        [req.params.id]
      );
      if (visitResult.rows.length === 0) return res.status(404).json({ error: 'No active visit found' });
      visitId = visitResult.rows[0].id;
    }

    // Get current status for history
    const current = await pool.query('SELECT status, bed_number FROM er_visits WHERE id = $1', [visitId]);
    const prevStatus = current.rows[0]?.status;
    const prevLocation = current.rows[0]?.bed_number;

    // Update the visit
    const updateFields: any = { status };
    if (location) updateFields.bed_number = location;
    if (status === 'discharged') updateFields.discharge_time = new Date().toISOString();

    const setClauses = Object.keys(updateFields).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const result = await pool.query(
      `UPDATE er_visits SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [visitId, ...Object.values(updateFields)]
    );

    // Record history
    await pool.query(
      `INSERT INTO patient_status_history (visit_id, previous_status, new_status, previous_location, new_location, changed_by_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [visitId, prevStatus, status, prevLocation, location || prevLocation, userId, notes || null]
    );

    // Emit WebSocket events
    const io = req.app.get('io');
    if (io) {
      io.emit('patient:status_change', { patientId: req.params.id, visitId, status, location });
      io.emit('queue:update', { action: 'status_change', patientId: req.params.id });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating patient status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const dischargePatient = async (req: Request, res: Response) => {
  req.body.status = 'discharged';
  return updatePatientStatus(req, res);
};

export const transferPatient = async (req: Request, res: Response) => {
  req.body.status = 'transferred';
  return updatePatientStatus(req, res);
};
