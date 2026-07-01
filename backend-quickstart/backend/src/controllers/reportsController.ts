import { Request, Response } from 'express';
import pool from '../config/database';

export const getReports = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.full_name as generated_by_name
       FROM reports r
       LEFT JOIN users u ON r.generated_by_id = u.id
       ORDER BY r.generated_at DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateReport = async (req: Request, res: Response) => {
  const { report_type, report_name, parameters } = req.body;
  const userId = req.user?.userId;

  try {
    if (!report_type || !report_name) {
      return res.status(400).json({ error: 'report_type and report_name are required' });
    }

    const result = await pool.query(
      `INSERT INTO reports (report_type, report_name, generated_by_id, parameters, status)
       VALUES ($1, $2, $3, $4, 'generating') RETURNING *`,
      [report_type, report_name, userId, JSON.stringify(parameters || {})]
    );

    const report = result.rows[0];

    // Simulate report generation completing after 2 seconds
    setTimeout(async () => {
      try {
        await pool.query(
          `UPDATE reports SET status = 'complete', file_path = $2, file_size = $3 WHERE id = $1`,
          [report.id, `/reports/${report.id}.pdf`, Math.floor(Math.random() * 10000) + 1000]
        );
      } catch (e) {
        console.error('Error completing report:', e);
      }
    }, 2000);

    res.status(201).json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReportStatus = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM reports WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching report status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM reports WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
