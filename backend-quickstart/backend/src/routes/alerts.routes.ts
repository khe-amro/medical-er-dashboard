import { Router } from 'express';
import { getAlerts, getUnreadCount, acknowledgeAlert, deleteAlert } from '../controllers/alertsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/unread-count', getUnreadCount);
router.get('/', getAlerts);
router.patch('/:id/acknowledge', acknowledgeAlert);
router.delete('/:id', deleteAlert);

export default router;
