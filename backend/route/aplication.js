import express from 'express';
import multer from 'multer';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import db from '../DB_config/knex.js';
import { jwtCheck, authorizeFaculty } from '../middleware/authMiddleware.js';

const router = express.Router();


const MAX_FILE_SIZE = 10 * 1024 * 1024; 

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only PDF files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

router.post(
  '/',
  jwtCheck,
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'motivation_letter', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const student_id = req.user.id;
      const { company_id } = req.body;

      // Validation
      if (!company_id) {
        return res.status(400).json({ message: 'company_id is required' });
      }

      if (!req.files?.cv || !req.files?.motivation_letter) {
        return res.status(400).json({
          message: 'CV and motivation letter (PDF) are required',
        });
      }

      // Check for duplicate application
      const existingApplication = await Application.query()
        .where('student_id', student_id)
        .where('company_id', company_id)
        .whereNot('status', 'rejected')
        .first();

      if (existingApplication) {
        return res.status(409).json({
          message: 'You already have an active application for this company',
        });
      }

      // Verify company exists
      const company = await Company.query().findById(company_id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Get company mentor (owner of company)
      const company_mentor_id = company.owner_id;

      // Get available faculty mentors (professors)
      const facultyMentors = await db('user')
        .whereIn('role', ['professor'])
        .select('id');
      
      if (!facultyMentors || facultyMentors.length === 0) {
        return res.status(500).json({ message: 'No faculty mentors available in the system' });
      }
      
      // Pick a random faculty mentor for fair distribution
      const randomIndex = Math.floor(Math.random() * facultyMentors.length);
      const faculty_mentor_id = facultyMentors[randomIndex].id;

      // Convert files to Base64 and store in database
      const cvBase64 = req.files.cv[0].buffer.toString('base64');
      const motivationBase64 = req.files.motivation_letter[0].buffer.toString('base64');
      
      const filesData = {
        cv: {
          data: cvBase64,
          filename: req.files.cv[0].originalname,
          mimetype: req.files.cv[0].mimetype
        },
        motivation_letter: {
          data: motivationBase64,
          filename: req.files.motivation_letter[0].originalname,
          mimetype: req.files.motivation_letter[0].mimetype
        }
      };

      const application = await Application.query().insert({
        student_id,
        company_id,
        company_mentor_id,
        faculty_mentor_id,
        uputnica_file: JSON.stringify(filesData),
        status: 'submitted',
        uptnica_status: 'pending',
      });

      res.status(201).json({
        message: 'Application submitted successfully!',
        application: {
          id: application.id,
          status: application.status,
          company_id: application.company_id,
        },
      });
    } catch (err) {
      console.error('Application submit error:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/my-applications', jwtCheck, async (req, res) => {
  try {
    const student_id = req.user.id;

    const applications = await Application.query()
      .where('application.student_id', student_id)
      .leftJoin('company', 'application.company_id', 'company.id')
      .select(
        'application.id',
        'application.company_id',
        'application.status',
        'application.uptnica_status',
        'application.is_created',
        'company.email as company_name'
      )
      .orderBy('application.is_created', 'desc');

    const formatted = applications.map((app) => ({
      id: app.id,
      company_id: app.company_id,
      company_name: app.company_name || 'Unknown',
      status: app.status,
      uptnica_status: app.uptnica_status,
      created_at: app.is_created,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Get my applications error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id/file/:fileType', jwtCheck, async (req, res) => {
  try {
    const { id, fileType } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role?.toLowerCase();

    if (!['cv', 'motivation_letter'].includes(fileType)) {
      return res.status(400).json({ message: 'Invalid file type. Use "cv" or "motivation_letter"' });
    }

    const application = await Application.query().findById(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }


    if (userRole === 'student' && application.student_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

   
    let filesData;
    try {
      filesData = JSON.parse(application.uputnica_file);
    } catch (e) {
      return res.status(500).json({ message: 'Error reading file data' });
    }

    const fileInfo = filesData[fileType];
    if (!fileInfo || !fileInfo.data) {
      return res.status(404).json({ message: 'File not found' });
    }

    
    const buffer = Buffer.from(fileInfo.data, 'base64');
    
    res.setHeader('Content-Type', fileInfo.mimetype || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename || fileType + '.pdf'}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (err) {
    console.error('File download error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/pending', jwtCheck, authorizeFaculty, async (req, res) => {
  try {
    const mentorId = req.user.id;
    const userRole = req.user.role?.toLowerCase();

    
    let query = Application.query()
      .where('application.status', 'submitted')
      .leftJoin('user as student', 'application.student_id', 'student.id')
      .leftJoin('company', 'application.company_id', 'company.id')
      .select(
        'application.id',
        'application.company_id',
        'application.status',
        'application.uptnica_status',
        'application.is_created',
        'application.faculty_mentor_id',
        'student.firstname as student_firstname',
        'student.lastname as student_lastname',
        'student.email as student_email',
        'student.jmbag as student_jmbag',
        'company.email as company_name'
      )
      .orderBy('application.is_created', 'asc');

    if (userRole !== 'admin') {
      query = query.where('application.faculty_mentor_id', mentorId);
    }

    const applications = await query;

    const formatted = applications.map((app) => ({
      id: app.id,
      student_name: app.student_firstname && app.student_lastname 
        ? `${app.student_firstname} ${app.student_lastname}` 
        : 'Unknown',
      student_email: app.student_email,
      student_jmbag: app.student_jmbag,
      company_name: app.company_name || 'Unknown',
      company_id: app.company_id,
      status: app.status,
      uptnica_status: app.uptnica_status,
      created_at: app.is_created,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Get pending applications error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', jwtCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const application = await Application.query()
      .where('application.id', id)
      .leftJoin('user as student', 'application.student_id', 'student.id')
      .leftJoin('company', 'application.company_id', 'company.id')
      .select(
        'application.*',
        'student.firstname as student_firstname',
        'student.lastname as student_lastname',
        'student.email as student_email',
        'company.email as company_name'
      )
      .first();

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (user.role === 'student' && application.student_id !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({
      id: application.id,
      student_name: application.student_firstname && application.student_lastname
        ? `${application.student_firstname} ${application.student_lastname}`
        : 'Unknown',
      student_email: application.student_email,
      company_name: application.company_name || 'Unknown',
      status: application.status,
      uptnica_status: application.uptnica_status,
      created_at: application.is_created,
    });
  } catch (err) {
    console.error('Get application error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id/approve', jwtCheck, authorizeFaculty, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role?.toLowerCase();

    const application = await Application.query().findById(id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (userRole !== 'admin' && application.faculty_mentor_id !== userId) {
      return res.status(403).json({ message: 'You are not the assigned mentor for this application' });
    }

    if (application.status === 'approved') {
      return res.status(400).json({ message: 'Application is already approved' });
    }

    if (application.status === 'rejected') {
      return res.status(400).json({ message: 'Cannot approve a rejected application' });
    }

    await Application.query().findById(id).patch({
      status: 'approved',
      uptnica_status: 'approved',
      is_updated: new Date().toISOString(),
    });

    res.status(200).json({
      message: 'Application approved successfully',
      application_id: id,
    });
  } catch (err) {
    console.error('Approve application error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id/reject', jwtCheck, authorizeFaculty, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role?.toLowerCase();

    const application = await Application.query().findById(id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (userRole !== 'admin' && application.faculty_mentor_id !== userId) {
      return res.status(403).json({ message: 'You are not the assigned mentor for this application' });
    }

    if (application.status === 'rejected') {
      return res.status(400).json({ message: 'Application is already rejected' });
    }

    if (application.status === 'approved') {
      return res.status(400).json({ message: 'Cannot reject an approved application' });
    }

    await Application.query().findById(id).patch({
      status: 'rejected',
      uptnica_status: 'rejected',
      is_updated: new Date().toISOString(),
    });

    res.status(200).json({
      message: 'Application rejected',
      application_id: id,
    });
  } catch (err) {
    console.error('Reject application error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/student/:student_id', jwtCheck, async (req, res) => {
  try {
    const { student_id } = req.params;
    const user = req.user;


    if (user.role === 'student' && user.id !== student_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await Application.query()
      .where('application.student_id', student_id)
      .leftJoin('company', 'application.company_id', 'company.id')
      .select(
        'application.id',
        'application.status',
        'application.is_created',
        'company.email as company_name'
      )
      .orderBy('application.is_created', 'desc');

    const formatted = applications.map((app) => ({
      id: app.id,
      company_name: app.company_name || 'Unknown',
      status: app.status,
      created_at: app.is_created,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Get student applications error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
