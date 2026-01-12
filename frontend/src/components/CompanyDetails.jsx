import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function CompanyDetails() {
  const { id } = useParams(); // ID iz URL-a
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
          "Greška pri dohvaćanju detalja kompanije"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id]);

  // LOADING STATE
  if (loading) {
    return <p>Učitavanje detalja kompanije...</p>;
  }

  // ERROR STATE
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  // Ako nema kompanije (ne bi se trebalo dogoditi, ali je sigurno)
  if (!company) {
    return <p>Nema podataka o kompaniji.</p>;
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>⬅ Natrag</button>

      <h2>Detalji kompanije</h2>

      <p><strong>OIB:</strong> {company.company_oib}</p>
      <p><strong>Email:</strong> {company.email}</p>
      <p><strong>Grad:</strong> {company.city}</p>
      <p><strong>Adresa:</strong> {company.address}</p>

      <p><strong>Sector ID:</strong> {company.sector_id}</p>
      <p><strong>Owner ID:</strong> {company.owner_id}</p>
    </div>
  );
}
