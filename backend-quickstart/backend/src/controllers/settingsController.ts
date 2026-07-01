import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';

export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    // Get user profile + settings
    const userResult = await pool.query(
      'SELECT id, email, full_name, role, department, phone, status FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    let settingsResult = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);

    // Create default settings if not exists
    if (settingsResult.rows.length === 0) {
      await pool.query('INSERT INTO user_settings (user_id) VALUES ($1)', [userId]);
      settingsResult = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
    }

    res.json({
      user: userResult.rows[0],
      settings: settingsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserSettings = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const updates = req.body;
  try {
    // Separate user profile fields from settings fields
    const userFields = ['full_name', 'department', 'phone'];
    const userUpdates: any = {};
    const settingsUpdates: any = {};

    for (const [key, value] of Object.entries(updates)) {
      if (userFields.includes(key)) {
        userUpdates[key] = value;
      } else {
        settingsUpdates[key] = value;
      }
    }

    // Update user profile
    if (Object.keys(userUpdates).length > 0) {
      const setClauses = Object.keys(userUpdates).map((k, i) => `${k} = $${i + 2}`).join(', ');
      await pool.query(
        `UPDATE users SET ${setClauses}, updated_at = NOW() WHERE id = $1`,
        [userId, ...Object.values(userUpdates)]
      );
    }

    // Update settings
    if (Object.keys(settingsUpdates).length > 0) {
      // Ensure settings row exists
      await pool.query(
        'INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
        [userId]
      );
      const setClauses = Object.keys(settingsUpdates).map((k, i) => `${k} = $${i + 2}`).join(', ');
      await pool.query(
        `UPDATE user_settings SET ${setClauses}, updated_at = NOW() WHERE user_id = $1`,
        [userId, ...Object.values(settingsUpdates)]
      );
    }

    // Return updated data
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.department, u.phone, s.*
       FROM users u
       LEFT JOIN user_settings s ON u.id = s.user_id
       WHERE u.id = $1`,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  try {
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValid) return res.status(401).json({ error: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
