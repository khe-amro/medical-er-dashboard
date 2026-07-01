import { Request, Response } from 'express';
import pool from '../config/database';

export const getVitals = async (req: Request, res: Response) => {
  try {
    const { visit_id } = req.query;
    let queryStr = `SELECT vs.*, u.full_name as recorded_by_name
       FROM vital_signs vs
       LEFT JOIN users u ON vs.recorded_by_id = u.id`;
    const params: any[] = [];

    if (visit_id) {
      queryStr += ' WHERE vs.visit_id = $1';
      params.push(visit_id);
    }
    queryStr += ' ORDER BY vs.recorded_at DESC LIMIT 100';

    const result = await pool.query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vitals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVitalById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM vital_signs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vital sign record not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching vital:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createVital = async (req: Request, res: Response) => {
  const { visit_id, systolic_bp, diastolic_bp, heart_rate, temperature, temperature_unit, oxygen_saturation, respiratory_rate, pain_level } = req.body;

  try {
    if (!visit_id) return res.status(400).json({ error: 'visit_id is required' });

    const recorded_by_id = req.user?.userId || null;

    const result = await pool.query(
      `INSERT INTO vital_signs (visit_id, recorded_by_id, systolic_bp, diastolic_bp, heart_rate, temperature, temperature_unit, oxygen_saturation, respiratory_rate, pain_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [visit_id, recorded_by_id, systolic_bp, diastolic_bp, heart_rate, temperature, temperature_unit || 'F', oxygen_saturation, respiratory_rate, pain_level]
    );

    // Emit real-time update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`patient:${visit_id}`).emit('vitals:update', result.rows[0]);
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating vital:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVital = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const check = await pool.query('SELECT id FROM vital_signs WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Vital sign record not found' });

    delete updates.id;
    delete updates.visit_id;

    const setClause = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    if (!setClause) return res.status(400).json({ error: 'No fields to update' });

    const result = await pool.query(
      `UPDATE vital_signs SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating vital:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVital = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM vital_signs WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vital sign record not found' });
    res.json({ message: 'Vital sign record deleted' });
  } catch (error) {
    console.error('Error deleting vital:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
