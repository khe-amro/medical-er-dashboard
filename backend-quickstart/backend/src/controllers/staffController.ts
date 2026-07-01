import { Request, Response } from 'express';
import pool from '../config/database';
import bcrypt from 'bcrypt';

export const getStaff = async (req: Request, res: Response) => {
  try {
    const { role, status } = req.query;
    let queryStr = 'SELECT id, email, full_name, role, department, phone, status, rating, patients_handled, shifts_completed, last_login, created_at FROM users';
    const conditions: string[] = [];
    const params: any[] = [];

    if (role) { params.push(role); conditions.push(`role = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    if (conditions.length) queryStr += ' WHERE ' + conditions.join(' AND ');
    queryStr += ' ORDER BY created_at DESC';

    const result = await pool.query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, department, phone, status, rating, patients_handled, shifts_completed, last_login, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  const { email, full_name, role, department, phone, status } = req.body;

  try {
    if (!email || !full_name || !role) {
      return res.status(400).json({ error: 'Email, full name, and role are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Default password for new staff is 'password123'
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('password123', saltRounds);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, department, phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, full_name, role, department, phone, status, created_at`,
      [email, passwordHash, full_name, role, department || null, phone || null, status || 'active']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const check = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });

    delete updates.id;
    delete updates.password_hash;
    delete updates.email;

    const setClause = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    if (!setClause) return res.status(400).json({ error: 'No fields to update' });

    const result = await pool.query(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING id, email, full_name, role, department, phone, status, rating`,
      [id, ...Object.values(updates)]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ message: 'Staff member removed' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStaffPerformance = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.role, u.department, u.rating, u.patients_handled, u.shifts_completed,
              COUNT(DISTINCT v.id) as active_visits
       FROM users u
       LEFT JOIN er_visits v ON (u.id = v.attending_doctor_id OR u.id = v.assigned_nurse_id) AND v.status IN ('waiting', 'in_treatment')
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching staff performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
