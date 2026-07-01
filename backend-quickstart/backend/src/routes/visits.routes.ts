import { Router } from 'express';
import { getVisits, getVisitById, createVisit, updateVisit } from '../controllers/visitsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all visit routes
router.use(authenticateToken);

router.get('/', getVisits);
router.post('/', createVisit);
router.get('/:id', getVisitById);
router.put('/:id', updateVisit);

export default router;
