import { Request, Response } from 'express';
import pool from '../config/database';

export const getOverview = async (req: Request, res: Response) => {
  try {
    const visits = await pool.query('SELECT COUNT(*) as total FROM er_visits WHERE created_at >= NOW() - INTERVAL \'24 hours\'');
    const activeStaff = await pool.query('SELECT COUNT(*) as total FROM users WHERE status = \'active\'');
    const critical = await pool.query('SELECT COUNT(*) as total FROM er_visits WHERE esi_level IN (1, 2) AND status IN (\'waiting\', \'in_treatment\')');
    const beds = await pool.query('SELECT COUNT(*) as total FROM er_visits WHERE status IN (\'waiting\', \'in_treatment\')');

    res.json({
      totalPatients24h: parseInt(visits.rows[0].total),
      activeStaff: parseInt(activeStaff.rows[0].total),
      criticalCases: parseInt(critical.rows[0].total),
      activePatients: parseInt(beds.rows[0].total)
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientFlow = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(arrival_time, 'HH24:00') as time,
        COUNT(CASE WHEN status = 'waiting' THEN 1 END) as arrivals,
        COUNT(CASE WHEN status = 'discharged' THEN 1 END) as discharges,
        COUNT(CASE WHEN status = 'admitted' THEN 1 END) as admits
      FROM er_visits 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY TO_CHAR(arrival_time, 'HH24:00')
      ORDER BY time
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patient flow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEsiDistribution = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        esi_level as name,
        COUNT(*) as value
      FROM er_visits 
      WHERE status IN ('waiting', 'in_treatment') AND esi_level IS NOT NULL
      GROUP BY esi_level
      ORDER BY esi_level
    `);
    
    // Format to expected ESI structure
    const formatted = result.rows.map(row => ({
      name: `ESI-${row.name}`,
      value: parseInt(row.value),
      color: `var(--esi-${row.name}-${['critical', 'emergent', 'urgent', 'less-urgent', 'non-urgent'][row.name - 1]})`
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching ESI distribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWaitTimes = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        esi_level,
        AVG(EXTRACT(EPOCH FROM (COALESCE(discharge_time, NOW()) - arrival_time))/60)::int as avg_wait
      FROM er_visits 
      WHERE created_at >= NOW() - INTERVAL '24 hours' AND esi_level IS NOT NULL
      GROUP BY esi_level
      ORDER BY esi_level
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wait times:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDepartmentMetrics = async (req: Request, res: Response) => {
  try {
    // Mock for now as we don't have department field in er_visits yet, 
    // but structure is ready for when it's added.
    res.json([
      { department: 'Cardiology', patients: 12, avgTime: 45, satisfaction: 4.2 },
      { department: 'Trauma', patients: 8, avgTime: 32, satisfaction: 4.5 },
      { department: 'General', patients: 25, avgTime: 68, satisfaction: 3.8 }
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDemographics = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 18 THEN '0-18'
          WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 18 AND 35 THEN '19-35'
          WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 36 AND 50 THEN '36-50'
          WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 51 AND 65 THEN '51-65'
          ELSE '65+'
        END as "ageGroup",
        COUNT(*) as count
      FROM patients
      GROUP BY 1
      ORDER BY 1
    `);
    
    const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    const formatted = result.rows.map(row => ({
      ageGroup: row.ageGroup,
      count: parseInt(row.count),
      percentage: Math.round((parseInt(row.count) / total) * 100)
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching demographics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientVolume = async (req: Request, res: Response) => {
  const period = req.query.period || 'monthly';
  try {
    // This is simplified; a real app would use date truncating based on period
    const result = await pool.query(`
      SELECT 
        TO_CHAR(arrival_time, 'Mon') as month,
        COUNT(CASE WHEN status != 'discharged' THEN 1 END) as admissions,
        COUNT(CASE WHEN status = 'discharged' THEN 1 END) as discharges,
        0 as readmissions
      FROM er_visits 
      WHERE arrival_time >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(arrival_time, 'Mon'), EXTRACT(MONTH FROM arrival_time)
      ORDER BY EXTRACT(MONTH FROM arrival_time)
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patient volume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
