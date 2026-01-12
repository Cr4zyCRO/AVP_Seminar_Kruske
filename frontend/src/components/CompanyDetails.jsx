import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Updated port to 5000
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function CompanyDetails() {
  const { id } = useParams(); // ID from URL params
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_URL}/companies/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCompany(res.data);
      } catch (err) {
        setError(
          err.response?.data?.error ||
          err.message ||
          "Error fetching company details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id]);

  // LOADING STATE
  if (loading) {
    return <p>Loading company details...</p>;
  }

  // ERROR STATE
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  // EMPTY STATE
  if (!company) {
    return <p>No company data found.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: "20px", cursor: "pointer" }}
      >
        ⬅ Back
      </button>

      <h2>Company Details</h2>

      <div style={{ lineHeight: "1.6" }}>
        <p><strong>Tax ID (OIB):</strong> {company.company_oib}</p>
        <p><strong>Email:</strong> {company.email}</p>
        <p><strong>City:</strong> {company.city}</p>
        <p><strong>Address:</strong> {company.address}</p>

        <hr style={{ margin: "20px 0", border: "0.5px solid #eee" }} />
        
        <p><strong>Sector ID:</strong> {company.sector_id}</p>
        <p><strong>Owner ID:</strong> {company.owner_id}</p>
      </div>
    </div>
  );
}