import express from 'express';
const router = express.Router();

import auth from '../middleware/authMiddleware.js';
import { createWorkDiaryEntry, updateLogEntry } from '../controllers/workDiaryController.js';

router.post('/work-diary', auth, createWorkDiaryEntry);
router.put("/work-diary/:id", auth, updateLogEntry);

export default router;




