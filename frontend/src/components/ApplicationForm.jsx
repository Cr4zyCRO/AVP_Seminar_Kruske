import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";

export default function ApplicationForm() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState({ name: "", email: "", study_program: "" });
  const [companyName, setCompanyName] = useState("");
  const [formData, setFormData] = useState({ motivation: "", startDate: "", endDate: "", notes: "" });
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
          name: studentRes.data.full_name,
          email: studentRes.data.email,
          study_program: studentRes.data.study_program
        });
        setCompanyName(companyRes.data.name || "Company");
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

    const data = new FormData();
    // Usklađeno s backendom (motivation_text, start_date, end_date)
    data.append("company_id", companyId);
    data.append("cv", files.cv);
    data.append("motivation_letter", files.motivationLetter);
    data.append("motivation_text", formData.motivation); 
    data.append("start_date", formData.startDate);
    data.append("end_date", formData.endDate);
    data.append("notes", formData.notes);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/users/applications", data, { // Provjeri je li prefiks /users/ ispravan u server.js
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error submitting application.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  if (success) return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
      <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
      <h2 className="text-2xl font-bold text-green-800">Application successful!</h2>
      <p className="text-green-700 mt-2">You have successfully applied to {companyName}.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white shadow-lg rounded-xl border border-gray-100">
      <h1 className="text-2xl font-bold mb-4">Internship application for: {companyName}</h1>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center"><AlertCircle className="mr-2"/>{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600 font-bold">{studentData.name} ({studentData.email})</p>
          <p className="text-xs text-gray-500">{studentData.study_program}</p>
        </div>

        <textarea
          placeholder="Your motivation..."
          className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-blue-500 outline-none"
          required
          value={formData.motivation}
          onChange={(e) => setFormData({...formData, motivation: e.target.value})}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 font-semibold uppercase">Start Date</label>
            <input 
              type="date" 
              required 
              className="w-full p-2 border rounded" 
              onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold uppercase">End Date</label>
            <input 
              type="date" 
              required 
              className="w-full p-2 border rounded" 
              onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 border-2 border-dashed rounded text-center transition-colors ${files.cv ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
             <label className="cursor-pointer">
                <Upload className={`mx-auto ${files.cv ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className="text-xs block mt-1 font-medium">CV (PDF)</span>
                <input type="file" hidden accept=".pdf" required onChange={(e) => setFiles({...files, cv: e.target.files[0]})} />
             </label>
             {files.cv && <p className="text-[10px] text-blue-600 truncate mt-1">{files.cv.name}</p>}
          </div>
          <div className={`p-4 border-2 border-dashed rounded text-center transition-colors ${files.motivationLetter ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
             <label className="cursor-pointer">
                <Upload className={`mx-auto ${files.motivationLetter ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className="text-xs block mt-1 font-medium">Cover Letter</span>
                <input type="file" hidden accept=".pdf" required onChange={(e) => setFiles({...files, motivationLetter: e.target.files[0]})} />
             </label>
             {files.motivationLetter && <p className="text-[10px] text-blue-600 truncate mt-1">{files.motivationLetter.name}</p>}
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading} 
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex justify-center items-center"
        >
          {loading ? (
            <><Loader2 className="animate-spin mr-2" size={20} /> Sending...</>
          ) : "Submit Application"}
        </button>
      </form>
    </div>
  );
}