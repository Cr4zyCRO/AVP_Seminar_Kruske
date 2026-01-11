import PracticeReport from '../models/PracticeReport.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

const enrichReport = async (report) => {
  if (!report) return null;
  
  const enriched = { ...report };
  
  if (report.application_id) {
    enriched.application = await Application.query().findById(report.application_id);
  }
  if (report.student_id) {
    enriched.student = await User.query().findById(report.student_id);
  }
  if (report.faculty_mentor_id) {
    enriched.facultyMentor = await User.query().findById(report.faculty_mentor_id);
  }
  
  return enriched;
};

export const getMyReport = async (req, res) => {
  try {
    const studentId = req.user.id;

    const report = await PracticeReport.query()
      .where('student_id', studentId)
      .first();

    if (!report) {
      return res.status(404).json({ message: 'Practice report not found.' });
    }

    const enrichedReport = await enrichReport(report);

    return res.status(200).json(enrichedReport);
  } catch (error) {
    console.error('Error fetching practice report:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};


export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    const report = await PracticeReport.query().findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Practice report not found.' });
    }

    
    if (userRole !== 'professor' && userRole !== 'admin' && report.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const enrichedReport = await enrichReport(report);

    return res.status(200).json(enrichedReport);
  } catch (error) {
    console.error('Error fetching practice report:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};


export const getAssignedReports = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const userRole = req.user.role;

    let query = PracticeReport.query();

    if (userRole === 'professor') {
      query = query.where('faculty_mentor_id', facultyId);
    }
    
    if (userRole === 'mentor') {
      const applications = await Application.query()
        .where('company_mentor_id', req.user.id)
        .select('id');
      
      const appIds = applications.map(a => a.id);
      query = query.whereIn('application_id', appIds);
    }

    const reports = await query;
    
    const enrichedReports = await Promise.all(reports.map(enrichReport));

    return res.status(200).json(enrichedReports);
  } catch (error) {
    console.error('Error fetching assigned reports:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const uploadReport = async (req, res) => {
  try {
    const studentId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can upload practice reports.' });
    }

    const { report_file, application_id } = req.body;

    if (!report_file) {
      return res.status(400).json({ message: 'Report file is required.' });
    }


    if (!report_file.startsWith('data:application/pdf;base64,')) {
      return res.status(400).json({ 
        message: 'Invalid file format. Only PDF files are accepted.' 
      });
    }


    const base64Data = report_file.split(',')[1];
    const fileSizeInBytes = (base64Data.length * 3) / 4;
    const maxSizeInBytes = 10 * 1024 * 1024; 
    
    if (fileSizeInBytes > maxSizeInBytes) {
      return res.status(400).json({ 
        message: 'File size exceeds 10MB limit.' 
      });
    }

    let report = await PracticeReport.query()
      .where('student_id', studentId)
      .first();

    if (report) {

      if (report.report_status !== 'draft') {
        return res.status(400).json({ 
          message: 'Cannot update report after submission.' 
        });
      }

      report = await PracticeReport.query()
        .patchAndFetchById(report.id, {
          report_file,
          is_updated: new Date().toISOString()
        });
    } else {
 
      if (!application_id) {
        return res.status(400).json({ message: 'Application ID is required for new report.' });
      }

     
      const application = await Application.query().findById(application_id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found.' });
      }

      report = await PracticeReport.query().insert({
        student_id: studentId,
        application_id,
        faculty_mentor_id: application.faculty_mentor_id,
        report_file,
        report_status: 'draft'
      });
    }

    return res.status(200).json({
      message: 'Report uploaded successfully.',
      report
    });
  } catch (error) {
    console.error('Error uploading report:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};


export const submitReport = async (req, res) => {
  try {
    const studentId = req.user.id;

    const report = await PracticeReport.query()
      .where('student_id', studentId)
      .first();

    if (!report) {
      return res.status(404).json({ message: 'Practice report not found.' });
    }

    if (!report.report_file) {
      return res.status(400).json({ message: 'Please upload a report file before submitting.' });
    }

    if (report.report_status !== 'draft') {
      return res.status(400).json({ message: 'Report has already been submitted.' });
    }

    const updatedReport = await PracticeReport.query()
      .patchAndFetchById(report.id, {
        report_status: 'submitted',
        is_updated: new Date().toISOString()
      });

    return res.status(200).json({
      message: 'Report submitted successfully.',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};


export const approveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const facultyId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'professor' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Only faculty can approve reports.' });
    }

    const report = await PracticeReport.query().findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Practice report not found.' });
    }


    if (userRole === 'professor' && report.faculty_mentor_id !== facultyId) {
      return res.status(403).json({ message: 'You are not assigned to this report.' });
    }

    if (report.report_status !== 'submitted') {
      return res.status(400).json({ message: 'Report must be submitted before approval.' });
    }

    const updatedReport = await PracticeReport.query()
      .patchAndFetchById(id, {
        report_status: 'approved_by_faculty',
        is_updated: new Date().toISOString()
      });

    return res.status(200).json({
      message: 'Report approved successfully.',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error approving report:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};


export const gradeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { final_grade } = req.body;
    const facultyId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'professor' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Only faculty can grade reports.' });
    }

    if (!final_grade) {
      return res.status(400).json({ message: 'Grade is required.' });
    }

    const report = await PracticeReport.query().findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Practice report not found.' });
    }


    if (userRole === 'professor' && report.faculty_mentor_id !== facultyId) {
      return res.status(403).json({ message: 'You are not assigned to this report.' });
    }

    if (report.report_status !== 'approved_by_faculty' && report.report_status !== 'submitted') {
      return res.status(400).json({ message: 'Report must be submitted or approved before grading.' });
    }

    const updatedReport = await PracticeReport.query()
      .patchAndFetchById(id, {
        final_grade,
        report_status: 'approved_by_faculty',
        is_updated: new Date().toISOString()
      });

    return res.status(200).json({
      message: 'Report graded successfully.',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error grading report:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};


export const rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const facultyId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'professor' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Only faculty can reject reports.' });
    }

    const report = await PracticeReport.query().findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Practice report not found.' });
    }

    if (userRole === 'professor' && report.faculty_mentor_id !== facultyId) {
      return res.status(403).json({ message: 'You are not assigned to this report.' });
    }

    const updatedReport = await PracticeReport.query()
      .patchAndFetchById(id, {
        report_status: 'draft',
        is_updated: new Date().toISOString()
      });

    return res.status(200).json({
      message: 'Report rejected and returned to draft.',
      report: updatedReport,
      rejection_reason
    });
  } catch (error) {
    console.error('Error rejecting report:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};
