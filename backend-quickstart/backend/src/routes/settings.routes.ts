import { Router } from 'express';
import { getUserSettings, updateUserSettings, changePassword } from '../controllers/settingsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/user', getUserSettings);
router.patch('/user', updateUserSettings);
router.patch('/password', changePassword);

export default router;
