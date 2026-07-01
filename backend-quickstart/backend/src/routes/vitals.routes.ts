import { Router } from 'express';
import { getVitals, getVitalById, createVital, updateVital, deleteVital } from '../controllers/vitalsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', getVitals);
router.post('/', createVital);
router.get('/:id', getVitalById);
router.put('/:id', updateVital);
router.delete('/:id', deleteVital);

export default router;
