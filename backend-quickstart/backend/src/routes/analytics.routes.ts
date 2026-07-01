import { Router } from 'express';
import { 
  getOverview, getPatientFlow, getEsiDistribution, 
  getWaitTimes, getDepartmentMetrics, getDemographics, getPatientVolume 
} from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/overview', getOverview);
router.get('/patient-flow', getPatientFlow);
router.get('/esi-distribution', getEsiDistribution);
router.get('/wait-times', getWaitTimes);
router.get('/department', getDepartmentMetrics);
router.get('/demographics', getDemographics);
router.get('/patient-volume', getPatientVolume);

export default router;
