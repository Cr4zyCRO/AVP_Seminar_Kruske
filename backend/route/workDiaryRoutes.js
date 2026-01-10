import express from 'express';
import Joi from 'joi';
import WorkDiaryController from '../controllers/workDiaryController.js';
import { jwtCheck } from '../middleware/authMiddleware.js';
import { body, query, params } from '../middleware/validate.js';

const router = express.Router();

// --- JOI SHEME ZA VALIDACIJU ---

const diaryEntrySchema = {
    date: Joi.date().iso().required(),
    hours: Joi.number().precision(1).min(0.5).max(24).required(),
    taskDescription: Joi.string().trim().min(5).required(),
    application_id: Joi.string().guid({ version: 'uuidv4' }).required()
};

const updateEntrySchema = {
    date: Joi.date().iso().required(),
    hours: Joi.number().precision(1).min(0.5).max(24).required(),
    taskDescription: Joi.string().trim().min(5).required()
};

const filterSchema = {
    from: Joi.date().iso().required(),
    to: Joi.date().iso().min(Joi.ref('from')).required(),
};

const idParamSchema = {
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
};

const studentIdParamSchema = {
    studentId: Joi.string().guid({ version: 'uuidv4' }).required(),
};

// --- RUTE ---

// 1. Student: Kreiranje novog unosa
router.post(
    "/work-diary", 
    jwtCheck, 
    body(diaryEntrySchema), 
    WorkDiaryController.createWorkDiaryEntry
);

// 2. Student: Ažuriranje postojećeg unosa
router.put(
    "/work-diary/:id", 
    jwtCheck, 
    params(idParamSchema), 
    body(updateEntrySchema), 
    WorkDiaryController.updateLogEntry
);

// 3. Student: Dohvat svih svojih unosa (Sortirano newest -> oldest)
router.get(
    "/log-entry", 
    jwtCheck, 
    WorkDiaryController.getAllLogEntries
);

// 4. Student: Filtriranje unosa po datumu
router.get(
    "/log-entry/filter", 
    jwtCheck, 
    query(filterSchema), 
    WorkDiaryController.getFilteredLogEntries
);

// 5. Student: Brisanje unosa
router.delete(
    "/log-entry/:id", 
    jwtCheck, 
    params(idParamSchema), 
    WorkDiaryController.deleteLogEntry
);

// 6. Student: Export dnevnika u PDF
router.get(
    "/log-entry/export/pdf", 
    jwtCheck, 
    WorkDiaryController.exportLogToPDF
);

// --- RUTE ZA MENTORE I PROFESORE ---

// 7. Mentor: Pregled dnevnika dodijeljenog studenta
router.get(
    "/mentor/students/:studentId/log-entries", 
    jwtCheck, 
    params(studentIdParamSchema), 
    WorkDiaryController.getStudentLogForMentor
);

// 8. Faculty (Profesor): Read-only pregled bilo kojeg studenta 
router.get(
    "/faculty/students/:studentId/log-entries", 
    jwtCheck, 
    params(studentIdParamSchema), 
    WorkDiaryController.getStudentLogForFaculty
);

export default router;