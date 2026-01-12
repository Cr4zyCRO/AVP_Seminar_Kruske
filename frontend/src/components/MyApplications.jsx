import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FileText, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Plus, Building } from "lucide-react";
import "./Dashboard.css";

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/applications/my-applications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusConfig = (status) => {
    const configs = {
      submitted: { bg: "#fff3cd", color: "#856404", icon: Clock, label: "Pending Review" },
      approved: { bg: "#d4edda", color: "#155724", icon: CheckCircle, label: "Approved" },
      rejected: { bg: "#f8d7da", color: "#721c24", icon: XCircle, label: "Rejected" },
    };
    return configs[status] || configs.submitted;
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
          My Internship Applications
        </h1>
        <button
          onClick={() => navigate("/companies")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#3c6e71",
            color: "#fff",
            padding: "0.625rem 1rem",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          <Plus size={18} />
          New Application
        </button>
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
          <FileText size={48} style={{ color: "#adb5bd", marginBottom: "1rem" }} />
          <h3 style={{ color: "#495057", marginBottom: "0.5rem" }}>No Applications Yet</h3>
          <p style={{ color: "#6c757d", marginBottom: "1.5rem" }}>
            Start by browsing companies and submitting your first internship application.
          </p>
          <button
            onClick={() => navigate("/companies")}
            style={{
              backgroundColor: "#3c6e71",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            Browse Companies
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {applications.map((app) => {
            const statusConfig = getStatusConfig(app.status);
            const StatusIcon = statusConfig.icon;
            return (
              <div 
                key={app.id} 
                style={{ 
                  backgroundColor: "#fff", 
                  borderRadius: "12px", 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
                  padding: "1.5rem" 
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <Building size={18} style={{ color: "#3c6e71" }} />
                      <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#1f2d3d" }}>
                        {app.company_name || app.company_email || "Company"}
                      </h3>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6c757d" }}>
                      Submitted: {new Date(app.is_created || app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "0.375rem",
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.color,
                    padding: "0.375rem 0.75rem",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "500"
                  }}>
                    <StatusIcon size={14} />
                    {statusConfig.label}
                  </span>
                </div>

                {app.status === "approved" && (
                  <div style={{ 
                    marginTop: "1rem", 
                    paddingTop: "1rem", 
                    borderTop: "1px solid #e9ecef" 
                  }}>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#155724", fontWeight: "500" }}>
                      ✓ Your application has been approved! You can now access Work Diary and Practice Report.
                    </p>
                  </div>
                )}

                {app.status === "rejected" && (
                  <div style={{ 
                    marginTop: "1rem", 
                    paddingTop: "1rem", 
                    borderTop: "1px solid #e9ecef" 
                  }}>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#721c24" }}>
                      Your application was rejected. You may apply to a different company.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
