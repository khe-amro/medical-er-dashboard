import { Router } from 'express';
import { getStaff, getStaffById, createStaff, updateStaff, deleteStaff, getStaffPerformance } from '../controllers/staffController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', getStaff);
router.post('/', requireRole('admin'), createStaff);
router.get('/:id', getStaffById);
router.get('/:id/performance', getStaffPerformance);
router.put('/:id', requireRole('admin'), updateStaff);
router.delete('/:id', requireRole('admin'), deleteStaff);

export default router;
