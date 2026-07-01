import { Router } from 'express';
import {
  getPatients, getPatientById, createPatient, updatePatient, deletePatient,
  getQueue, searchPatients, getPatientHistory, getPatientVitals,
  getPatientNotes, createPatientNote,
  updatePatientStatus, dischargePatient, transferPatient
} from '../controllers/patientsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// Queue & Search (before :id routes)
router.get('/queue', getQueue);
router.get('/search', searchPatients);

// CRUD
router.get('/', getPatients);
router.post('/', createPatient);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

// Sub-resources
router.get('/:id/history', getPatientHistory);
router.get('/:id/vitals', getPatientVitals);
router.get('/:id/notes', getPatientNotes);
router.post('/:id/notes', createPatientNote);

// Status operations
router.patch('/:id/status', updatePatientStatus);
router.patch('/:id/discharge', dischargePatient);
router.post('/:id/transfer', transferPatient);

export default router;
