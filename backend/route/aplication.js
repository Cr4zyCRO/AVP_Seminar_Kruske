const express = require('express');
const router = express.Router();
const upload = require('../middlewares/applicationUpload');
const Application = require('../models/Application');

router.post(
  '/applications',
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'motivation_letter', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { company_id } = req.body;
      const student_id = req.user.id; // JWT auth

      if (!company_id) {
        return res.status(400).json({ message: 'company_id is required' });
      }

      if (!req.files?.cv || !req.files?.motivation_letter) {
        return res.status(400).json({
          message: 'CV and motivation letter are required',
        });
      }

      const application = await Application.query().insert({
        student_id,
        company_id,
        status: 'submitted',
        uputnica_file: JSON.stringify({
          cv: req.files.cv[0].path,
          motivation_letter: req.files.motivation_letter[0].path,
        }),
      });

      res.status(201).json({
        message: 'Application submitted successfully',
        application,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.get('/applications/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;

    const applications = await Application.query()
      .where('application.student_id', student_id)
      .joinRelated('company')
      .select(
        'application.id',
        'application.status',
        'application.created_at',
        'company.name as company_name'
      )
      .orderBy('application.created_at', 'desc');

    res.status(200).json(applications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
module.exports = router;
