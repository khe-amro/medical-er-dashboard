import { Router } from 'express';
import { getLabs, getLabById, createLab, updateLab } from '../controllers/labsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', getLabs);
router.post('/', createLab);
router.get('/:id', getLabById);
router.put('/:id', updateLab);

export default router;
