import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './FacultyReportReview.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

export default function FacultyReportReview() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/practice-reports/assigned`, {
        headers: getAuthHeaders()
      });
      setReports(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleApprove = async (reportId) => {
    try {
      setActionLoading(true);
      setError('');

      await axios.patch(
        `${API_URL}/practice-reports/${reportId}/approve`,
        {},
        { headers: getAuthHeaders() }
      );

      setSuccessMessage('Report approved successfully!');
      fetchReports();
      setSelectedReport(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reportId) => {
    try {
      setActionLoading(true);
      setError('');

      await axios.patch(
        `${API_URL}/practice-reports/${reportId}/reject`,
        { rejection_reason: 'Report needs revision' },
        { headers: getAuthHeaders() }
      );

      setSuccessMessage('Report rejected and returned to student.');
      fetchReports();
      setSelectedReport(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrade = async (reportId) => {
    if (!gradeInput) {
      setError('Please enter a grade.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      await axios.patch(
        `${API_URL}/practice-reports/${reportId}/grade`,
        { final_grade: gradeInput },
        { headers: getAuthHeaders() }
      );

      setSuccessMessage('Report graded successfully!');
      setGradeInput('');
      fetchReports();
      setSelectedReport(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to grade report.');
    } finally {
      setActionLoading(false);
    }
  };

  const downloadReport = (reportFile) => {
    if (!reportFile) return;
    const link = document.createElement('a');
    link.href = reportFile;
    link.download = 'student_practice_report.pdf';
    link.click();
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

  if (loading) {
    return (
      <div className="faculty-review-container">
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="faculty-review-container">
      <h2>Student Practice Reports</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {reports.length === 0 ? (
        <div className="no-reports">
          <p>No practice reports assigned to you.</p>
        </div>
      ) : (
        <div className="reports-grid">
          <div className="reports-list">
            <h3>All Reports ({reports.length})</h3>
            {reports.map(report => (
              <div
                key={report.id}
                className={`report-item ${selectedReport?.id === report.id ? 'selected' : ''}`}
                onClick={() => setSelectedReport(report)}
              >
                <div className="report-item-header">
                  <span className="student-name">
                    {report.student?.firstname} {report.student?.lastname}
                  </span>
                  {getStatusBadge(report.report_status)}
                </div>
                <div className="report-item-meta">
                  <span>{new Date(report.is_updated).toLocaleDateString()}</span>
                  {report.final_grade && (
                    <span className="grade-preview">Grade: {report.final_grade}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="report-detail">
            {selectedReport ? (
              <>
                <div className="detail-header">
                  <h3>Report Details</h3>
                  {getStatusBadge(selectedReport.report_status)}
                </div>

                <div className="detail-content">
                  <div className="detail-row">
                    <span className="label">Student:</span>
                    <span className="value">
                      {selectedReport.student?.firstname} {selectedReport.student?.lastname}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedReport.student?.email}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">JMBAG:</span>
                    <span className="value">{selectedReport.student?.jmbag}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Submitted:</span>
                    <span className="value">
                      {new Date(selectedReport.is_updated).toLocaleString()}
                    </span>
                  </div>

                  {selectedReport.final_grade && (
                    <div className="detail-row">
                      <span className="label">Current Grade:</span>
                      <span className="value grade">{selectedReport.final_grade}</span>
                    </div>
                  )}

                  {selectedReport.report_file && (
                    <div className="file-download">
                      <button 
                        className="download-btn"
                        onClick={() => downloadReport(selectedReport.report_file)}
                      >
                        📄 Download Report PDF
                      </button>
                    </div>
                  )}

                  <div className="actions-section">
                    {selectedReport.report_status === 'submitted' && (
                      <div className="action-buttons">
                        <button
                          className="approve-btn"
                          onClick={() => handleApprove(selectedReport.id)}
                          disabled={actionLoading}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleReject(selectedReport.id)}
                          disabled={actionLoading}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}

                    {(selectedReport.report_status === 'approved_by_faculty' || 
                      selectedReport.report_status === 'submitted') && !selectedReport.final_grade && (
                      <div className="grade-section">
                        <h4>Assign Grade</h4>
                        <div className="grade-input-group">
                          <select
                            value={gradeInput}
                            onChange={(e) => setGradeInput(e.target.value)}
                          >
                            <option value="">Select grade</option>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very Good</option>
                            <option value="3">3 - Good</option>
                            <option value="2">2 - Sufficient</option>
                            <option value="1">1 - Insufficient</option>
                          </select>
                          <button
                            className="grade-btn"
                            onClick={() => handleGrade(selectedReport.id)}
                            disabled={actionLoading || !gradeInput}
                          >
                            Submit Grade
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedReport.report_status === 'approved_by_faculty' && selectedReport.final_grade && (
                      <div className="completed-message">
                        ✅ This report has been approved and graded.
                      </div>
                    )}

                    {selectedReport.report_status === 'draft' && (
                      <div className="draft-message">
                        ⏳ This report is still in draft. Waiting for student submission.
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <p>Select a report from the list to view details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
