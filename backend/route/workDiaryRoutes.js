const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createWorkDiaryEntry } = require('../controllers/workDiaryController');

router.post('/work-diary', auth, createWorkDiaryEntry);
router.put("/work-diary/:id", auth, updateLogEntry);

module.exports = router;
