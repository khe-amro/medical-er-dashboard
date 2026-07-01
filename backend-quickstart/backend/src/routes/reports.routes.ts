import { Router } from 'express';
import { getReports, generateReport, getReportStatus, deleteReport } from '../controllers/reportsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', getReports);
router.post('/generate', generateReport);
router.get('/:id/status', getReportStatus);
router.delete('/:id', deleteReport);

export default router;
