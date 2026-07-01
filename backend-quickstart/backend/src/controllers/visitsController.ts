import { Request, Response } from 'express';
import pool from '../config/database';

export const getVisits = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT v.*, 
              p.first_name as patient_first_name, 
              p.last_name as patient_last_name, 
              p.mrn
       FROM er_visits v
       JOIN patients p ON v.patient_id = p.id
       ORDER BY v.esi_level ASC NULLS LAST, v.arrival_time ASC
       LIMIT 100`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVisitById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT v.*, 
              p.first_name as patient_first_name, 
              p.last_name as patient_last_name, 
              p.mrn, p.date_of_birth, p.gender
       FROM er_visits v
       JOIN patients p ON v.patient_id = p.id
       WHERE v.id = $1`, 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching visit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createVisit = async (req: Request, res: Response) => {
  const { patient_id, chief_complaint, esi_level, bed_number, attending_doctor_id, assigned_nurse_id, notes } = req.body;

  try {
    if (!patient_id || !chief_complaint) {
      return res.status(400).json({ error: 'Missing required fields (patient_id, chief_complaint)' });
    }

    const result = await pool.query(
      `INSERT INTO er_visits (
        patient_id, chief_complaint, esi_level, bed_number, 
        attending_doctor_id, assigned_nurse_id, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        patient_id, chief_complaint, esi_level, bed_number,
        attending_doctor_id, assigned_nurse_id, notes
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating visit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVisit = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    // Check if exists
    const check = await pool.query('SELECT id FROM er_visits WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    // Prevent updating id or patient_id
    delete updates.id;
    delete updates.patient_id;

    if (updates.status === 'discharged' && !updates.discharge_time) {
      updates.discharge_time = new Date().toISOString();
    }
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
      
    if (!setClause) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    const values = [id, ...Object.values(updates)];
    
    const result = await pool.query(
      `UPDATE er_visits SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating visit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
