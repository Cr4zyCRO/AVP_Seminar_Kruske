import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { 
  FileText, Clock, CheckCircle, XCircle, Loader2, AlertCircle, 
  User, Building, ChevronDown, ChevronUp 
} from "lucide-react";
import "./Dashboard.css";

export default function ApplicationApproval() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingApplications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/applications/pending", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error loading applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingApplications();
  }, [fetchPendingApplications]);

  const handleApprove = async (id) => {
    setProcessingId(id);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/applications/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Application approved successfully!");
      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error approving application");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/applications/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Application rejected");
      setApplications(prev => prev.filter(app => app.id !== id));
      setExpandedId(null);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error rejecting application");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="content">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" size={40} style={{ color: "#3c6e71" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#1f2d3d", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FileText size={28} style={{ color: "#3c6e71" }} />
          Pending Internship Applications
        </h1>
        <span style={{ 
          backgroundColor: "#fff3cd", 
          color: "#856404", 
          padding: "0.375rem 0.75rem", 
          borderRadius: "20px", 
          fontSize: "0.875rem", 
          fontWeight: "500" 
        }}>
          {applications.length} Pending
        </span>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          padding: "1rem", 
          borderRadius: "8px", 
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <AlertCircle size={20} />
          {error}
          <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "#721c24", cursor: "pointer", fontSize: "1.25rem" }}>×</button>
        </div>
      )}

      {success && (
        <div style={{ 
          backgroundColor: "#d4edda", 
          color: "#155724", 
          padding: "1rem", 
          borderRadius: "8px", 
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <CheckCircle size={20} />
          {success}
          <button onClick={() => setSuccess("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "#155724", cursor: "pointer", fontSize: "1.25rem" }}>×</button>
        </div>
      )}

      {applications.length === 0 ? (
        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: "12px", 
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
          padding: "3rem", 
          textAlign: "center" 
        }}>
          <CheckCircle size={48} style={{ color: "#28a745", marginBottom: "1rem" }} />
          <h3 style={{ color: "#495057", marginBottom: "0.5rem" }}>All Caught Up!</h3>
          <p style={{ color: "#6c757d", margin: 0 }}>No pending applications to review.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {applications.map((app) => (
            <div 
              key={app.id} 
              style={{ 
                backgroundColor: "#fff", 
                borderRadius: "12px", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
                padding: "1.5rem" 
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <User size={18} style={{ color: "#6c757d" }} />
                    <span style={{ fontWeight: "600", color: "#1f2d3d" }}>{app.student_name}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#6c757d" }}>{app.student_email}</p>
                  {app.student_jmbag && (
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#adb5bd" }}>JMBAG: {app.student_jmbag}</p>
                  )}
                </div>
                <span style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "0.375rem",
                  backgroundColor: "#fff3cd",
                  color: "#856404",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "500"
                }}>
                  <Clock size={14} />
                  Pending Review
                </span>
              </div>

              {/* Company Info */}
              <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Building size={16} style={{ color: "#3c6e71" }} />
                  <span style={{ fontWeight: "500", color: "#495057" }}>{app.company_name}</span>
                </div>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#6c757d" }}>
                  Submitted: {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid #e9ecef" }}>
                <button
                  onClick={() => handleApprove(app.id)}
                  disabled={processingId === app.id}
                  style={{
                    flex: 1,
                    backgroundColor: processingId === app.id ? "#adb5bd" : "#28a745",
                    color: "#fff",
                    padding: "0.625rem 1rem",
                    border: "none",
                    borderRadius: "8px",
                    cursor: processingId === app.id ? "not-allowed" : "pointer",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}
                >
                  {processingId === app.id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  disabled={processingId === app.id}
                  style={{
                    flex: 1,
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    padding: "0.625rem 1rem",
                    border: "none",
                    borderRadius: "8px",
                    cursor: processingId === app.id ? "not-allowed" : "pointer",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}
                >
                  <XCircle size={18} />
                  Reject
                  {expandedId === app.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Reject Confirmation */}
              {expandedId === app.id && (
                <div style={{ 
                  marginTop: "1rem", 
                  padding: "1rem", 
                  backgroundColor: "#fff5f5", 
                  borderRadius: "8px", 
                  textAlign: "center" 
                }}>
                  <p style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", color: "#721c24" }}>
                    Are you sure you want to reject this application?
                  </p>
                  <button
                    onClick={() => handleReject(app.id)}
                    disabled={processingId === app.id}
                    style={{
                      backgroundColor: processingId === app.id ? "#adb5bd" : "#dc3545",
                      color: "#fff",
                      padding: "0.5rem 1.5rem",
                      border: "none",
                      borderRadius: "6px",
                      cursor: processingId === app.id ? "not-allowed" : "pointer",
                      fontWeight: "500"
                    }}
                  >
                    {processingId === app.id ? "Processing..." : "Confirm Rejection"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
