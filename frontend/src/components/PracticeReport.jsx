import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PracticeReport.css';

const API_URL = 'http://localhost:5000';

export default function PracticeReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/practice-reports/my-report`, {
        headers: getAuthHeaders()
      });
      setReport(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setReport(null);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch report.');
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/users/my-applications`, {
        headers: getAuthHeaders()
      });
      setApplications(res.data || []);
    } catch (err) {
      console.log('Could not fetch applications:', err);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchReport();
    fetchApplications();
  }, [fetchReport, fetchApplications]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    try {
      setUploading(true);
      setError('');

 
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        
        try {
          const payload = {
            report_file: base64
          };

        
          if (!report && selectedAppId) {
            payload.application_id = selectedAppId;
          }

          const res = await axios.post(
            `${API_URL}/practice-reports/upload`,
            payload,
            { headers: getAuthHeaders() }
          );

          setReport(res.data.report);
          setSuccessMessage('Report uploaded successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to upload report.');
        } finally {
          setUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read file.');
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      const res = await axios.post(
        `${API_URL}/practice-reports/submit`,
        {},
        { headers: getAuthHeaders() }
      );

      setReport(res.data.report);
      setSuccessMessage('Report submitted for review!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'status-draft',
      submitted: 'status-submitted',
      approved_by_faculty: 'status-approved'
    };
    const statusLabels = {
      draft: 'DRAFT',
      submitted: 'SUBMITTED',
      approved_by_faculty: 'APPROVED'
    };
    return (
      <span className={`status-badge ${statusClasses[status] || ''}`}>
        {statusLabels[status] || status?.toUpperCase() || 'N/A'}
      </span>
    );
  };

  const downloadReport = () => {
    if (!report?.report_file) return;

    const link = document.createElement('a');
    link.href = report.report_file;
    link.download = 'practice_report.pdf';
    link.click();
  };

  const viewReport = () => {
    if (!report?.report_file) return;
    
    const newWindow = window.open();
    newWindow.document.write(
      `<iframe src="${report.report_file}" style="width:100%;height:100%;border:none;" />`
    );
  };

  if (loading) {
    return (
      <div className="practice-report-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="practice-report-container">
      <h2>My Practice Report</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {!report ? (
        <div className="no-report">
          <div className="info-box">
            <h3>No Practice Report Found</h3>
            <p>Upload your internship practice report to get started.</p>
          </div>

          {applications.length > 0 && (
            <div className="form-group">
              <label>Select Application:</label>
              <select 
                value={selectedAppId} 
                onChange={(e) => setSelectedAppId(e.target.value)}
              >
                <option value="">-- Select an application --</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.company?.name || 'Application'} - {app.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="upload-section">
            <label className="upload-btn">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading || (!selectedAppId && applications.length > 0)}
              />
              {uploading ? 'Uploading...' : 'Upload PDF Report'}
            </label>
            <p className="hint">Only PDF files up to 10MB are accepted.</p>
          </div>
        </div>
      ) : (
        <div className="report-details">
          <div className="report-card">
            <div className="report-header">
              <h3>Report Status</h3>
              {getStatusBadge(report.report_status)}
            </div>

            <div className="report-info">
              <div className="info-row">
                <span className="label">Created:</span>
                <span className="value">
                  {new Date(report.is_created).toLocaleDateString()}
                </span>
              </div>

              <div className="info-row">
                <span className="label">Last Updated:</span>
                <span className="value">
                  {new Date(report.is_updated).toLocaleDateString()}
                </span>
              </div>

              {report.facultyMentor && (
                <div className="info-row">
                  <span className="label">Faculty Mentor:</span>
                  <span className="value">
                    {report.facultyMentor.firstname} {report.facultyMentor.lastname}
                  </span>
                </div>
              )}

              {report.final_grade && (
                <div className="info-row grade-row">
                  <span className="label">Final Grade:</span>
                  <span className="value grade">{report.final_grade}</span>
                </div>
              )}
            </div>

            {report.report_file && (
              <div className="file-section">
                <button className="view-btn" onClick={viewReport}>
                  👁️ View Report
                </button>
                <button className="download-btn" onClick={downloadReport}>
                  📄 Download Report
                </button>
              </div>
            )}

            <div className="actions">
              {report.report_status === 'draft' && (
                <>
                  <label className="upload-btn secondary">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    {uploading ? 'Uploading...' : 'Replace PDF'}
                  </label>

                  <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={submitting || !report.report_file}
                  >
                    {submitting ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </>
              )}

              {report.report_status === 'submitted' && (
                <div className="pending-message">
                  ⏳ Your report is pending faculty review.
                </div>
              )}

              {report.report_status === 'approved_by_faculty' && !report.final_grade && (
                <div className="approved-message">
                  ✅ Your report has been approved by faculty. Awaiting grade.
                </div>
              )}

              {report.report_status === 'approved_by_faculty' && report.final_grade && (
                <div className="graded-message">
                  🎓 Your report has been approved and graded!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
