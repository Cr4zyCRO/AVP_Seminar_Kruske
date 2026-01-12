import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import { AlertCircle, CheckCircle2, Loader2, Upload, Building, ArrowLeft } from "lucide-react";
import "./Dashboard.css";

export default function ApplicationForm() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState({ name: "", email: "", study_program: "" });
  const [companyName, setCompanyName] = useState("");
  const [files, setFiles] = useState({ cv: null, motivationLetter: null });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const [studentRes, companyRes] = await Promise.all([
          axios.get("http://localhost:5000/auth/me", { headers }),
          axios.get(`http://localhost:5000/companies/${companyId}`, { headers })
        ]);
        
        setStudentData({
          name: studentRes.data.full_name || `${studentRes.data.firstname} ${studentRes.data.lastname}`,
          email: studentRes.data.email,
          study_program: studentRes.data.study_program || studentRes.data.jmbag || ""
        });
        setCompanyName(companyRes.data.email || "Company");
      } catch (err) {
        setError("Error loading initial data.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, [companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!files.cv || !files.motivationLetter) {
      setError("Please upload both CV and Motivation Letter (PDF).");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("company_id", companyId);
    data.append("cv", files.cv);
    data.append("motivation_letter", files.motivationLetter);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/applications", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setSuccess(true);
      setTimeout(() => navigate("/my-applications"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error submitting application.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="content">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" size={40} style={{ color: "#3c6e71" }} />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="content">
        <div style={{ 
          maxWidth: "500px", 
          margin: "2rem auto", 
          padding: "2rem", 
          backgroundColor: "#d4edda", 
          border: "1px solid #c3e6cb", 
          borderRadius: "12px", 
          textAlign: "center" 
        }}>
          <CheckCircle2 size={48} style={{ color: "#28a745", marginBottom: "1rem" }} />
          <h2 style={{ color: "#155724", marginBottom: "0.5rem" }}>Application Submitted!</h2>
          <p style={{ color: "#155724" }}>You have successfully applied to {companyName}.</p>
          <p style={{ color: "#6c757d", fontSize: "0.9rem", marginTop: "1rem" }}>Redirecting to My Applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div style={{ marginBottom: "1.5rem" }}>
        <button 
          onClick={() => navigate("/companies")}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            background: "none", 
            border: "none", 
            color: "#3c6e71", 
            cursor: "pointer",
            fontSize: "0.95rem",
            padding: 0
          }}
        >
          <ArrowLeft size={18} />
          Back to Companies
        </button>
      </div>

      <div style={{ 
        backgroundColor: "#fff", 
        borderRadius: "12px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
        padding: "2rem",
        maxWidth: "600px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Building size={28} style={{ color: "#3c6e71" }} />
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#1f2d3d" }}>Internship Application</h1>
        </div>

        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "1rem", 
          borderRadius: "8px", 
          marginBottom: "1.5rem",
          borderLeft: "4px solid #3c6e71"
        }}>
          <p style={{ margin: 0, fontWeight: "600", color: "#1f2d3d" }}>Company: {companyName}</p>
        </div>
        
        {error && (
          <div style={{ 
            marginBottom: "1rem", 
            padding: "0.75rem 1rem", 
            backgroundColor: "#f8d7da", 
            color: "#721c24", 
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ 
            backgroundColor: "#e9ecef", 
            padding: "1rem", 
            borderRadius: "8px", 
            marginBottom: "1.5rem" 
          }}>
            <p style={{ margin: 0, fontWeight: "600", color: "#495057" }}>{studentData.name}</p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem", color: "#6c757d" }}>{studentData.email}</p>
            {studentData.study_program && (
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#6c757d" }}>{studentData.study_program}</p>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <label style={{ 
              padding: "1.5rem", 
              border: `2px dashed ${files.cv ? '#3c6e71' : '#ced4da'}`,
              borderRadius: "8px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: files.cv ? '#e8f4f5' : '#fff',
              transition: "all 0.2s"
            }}>
              <Upload size={24} style={{ color: files.cv ? '#3c6e71' : '#adb5bd', marginBottom: "0.5rem" }} />
              <span style={{ display: "block", fontWeight: "500", color: "#495057" }}>CV (PDF)</span>
              <input 
                type="file" 
                hidden 
                accept=".pdf" 
                required 
                onChange={(e) => setFiles({...files, cv: e.target.files[0]})} 
              />
              {files.cv && (
                <span style={{ display: "block", fontSize: "0.75rem", color: "#3c6e71", marginTop: "0.5rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {files.cv.name}
                </span>
              )}
            </label>

            <label style={{ 
              padding: "1.5rem", 
              border: `2px dashed ${files.motivationLetter ? '#3c6e71' : '#ced4da'}`,
              borderRadius: "8px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: files.motivationLetter ? '#e8f4f5' : '#fff',
              transition: "all 0.2s"
            }}>
              <Upload size={24} style={{ color: files.motivationLetter ? '#3c6e71' : '#adb5bd', marginBottom: "0.5rem" }} />
              <span style={{ display: "block", fontWeight: "500", color: "#495057" }}>Motivation Letter (PDF)</span>
              <input 
                type="file" 
                hidden 
                accept=".pdf" 
                required 
                onChange={(e) => setFiles({...files, motivationLetter: e.target.files[0]})} 
              />
              {files.motivationLetter && (
                <span style={{ display: "block", fontSize: "0.75rem", color: "#3c6e71", marginTop: "0.5rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {files.motivationLetter.name}
                </span>
              )}
            </label>
          </div>

          <button 
            type="submit"
            disabled={loading} 
            style={{
              width: "100%",
              padding: "0.875rem",
              backgroundColor: loading ? "#adb5bd" : "#3c6e71",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Submitting...
              </>
            ) : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}