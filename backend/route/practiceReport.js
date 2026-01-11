import express from 'express';
import { jwtCheck } from '../middleware/authMiddleware.js';
import {
  getMyReport,
  getReportById,
  getAssignedReports,
  uploadReport,
  submitReport,
  approveReport,
  gradeReport,
  rejectReport
} from '../controllers/practiceReportController.js';

const router = express.Router();

// Student routes
router.get('/my-report', jwtCheck, getMyReport);
router.post('/upload', jwtCheck, uploadReport);
router.post('/submit', jwtCheck, submitReport);

// Faculty/Admin routes
router.get('/assigned', jwtCheck, getAssignedReports);
router.get('/:id', jwtCheck, getReportById);
router.patch('/:id/approve', jwtCheck, approveReport);
router.patch('/:id/grade', jwtCheck, gradeReport);
router.patch('/:id/reject', jwtCheck, rejectReport);

export default router;
