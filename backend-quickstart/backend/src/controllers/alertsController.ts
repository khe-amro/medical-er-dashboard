import { Request, Response } from 'express';
import pool from '../config/database';

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
        p.first_name as patient_first_name, 
        p.last_name as patient_last_name
       FROM alerts a
       LEFT JOIN er_visits v ON a.visit_id = v.id
       LEFT JOIN patients p ON v.patient_id = p.id
       ORDER BY a.created_at DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*)::int FROM alerts WHERE acknowledged = false'
    );
    res.json({ count: result.rows[0].count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acknowledgeAlert = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  try {
    const result = await pool.query(
      `UPDATE alerts 
       SET acknowledged = true, acknowledged_by_id = $2, updated_at = NOW() 
       WHERE id = $1 RETURNING *`,
      [id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM alerts WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
