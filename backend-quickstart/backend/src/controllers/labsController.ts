import { Request, Response } from 'express';
import pool from '../config/database';

export const getLabs = async (req: Request, res: Response) => {
  try {
    const { visit_id } = req.query;
    let queryStr = `SELECT lr.*, u.full_name as ordered_by_name
       FROM lab_results lr
       LEFT JOIN users u ON lr.ordered_by_id = u.id`;
    const params: any[] = [];
    if (visit_id) { queryStr += ' WHERE lr.visit_id = $1'; params.push(visit_id); }
    queryStr += ' ORDER BY lr.resulted_at DESC LIMIT 100';

    const result = await pool.query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching labs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLabById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM lab_results WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lab result not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching lab:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLab = async (req: Request, res: Response) => {
  const { visit_id, test_name, test_value, test_unit, reference_range, is_critical, notes } = req.body;

  try {
    if (!visit_id || !test_name || !test_value) {
      return res.status(400).json({ error: 'visit_id, test_name, and test_value are required' });
    }

    const ordered_by_id = req.user?.userId || null;
    const result = await pool.query(
      `INSERT INTO lab_results (visit_id, test_name, test_value, test_unit, reference_range, is_critical, ordered_by_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [visit_id, test_name, test_value, test_unit, reference_range, is_critical || false, ordered_by_id, notes]
    );

    // Emit alert if critical
    if (is_critical) {
      const io = req.app.get('io');
      if (io) io.emit('alert:new', { alert_type: 'critical', title: `Critical Lab: ${test_name}`, message: `Value: ${test_value} ${test_unit || ''}`, visit_id });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating lab result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLab = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const check = await pool.query('SELECT id FROM lab_results WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Lab result not found' });

    delete updates.id;
    const setClause = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    if (!setClause) return res.status(400).json({ error: 'No fields to update' });

    const result = await pool.query(
      `UPDATE lab_results SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating lab result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
