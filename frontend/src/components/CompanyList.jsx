import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import { Building, Search, Loader2, AlertCircle } from "lucide-react";
import "./Dashboard.css";

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dohvat sektora za dropdown (Port 5000)
  const fetchSectors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/sectors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSectors(res.data);
    } catch (err) {
      console.error("Error fetching sectors", err);
    }
  };

  // Dohvat kompanija (Port 5000)
  const fetchCompanies = async (searchValue = "", sectorId = "") => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/companies", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchValue,
          sectorId: sectorId || undefined,
        },
      });
      setCompanies(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
    fetchCompanies();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(search, selectedSector);
  };

  const handleSectorChange = (e) => {
    const sectorId = e.target.value;
    setSelectedSector(sectorId);
    fetchCompanies(search, sectorId);
  };

  return (
    <div className="content">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <Building size={28} style={{ color: "#3c6e71" }} />
        <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#1f2d3d" }}>Browse Companies</h1>
      </div>

      {/* SEARCH + FILTERS */}
      <div style={{ 
        backgroundColor: "#fff", 
        padding: "1.25rem", 
        borderRadius: "12px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
        marginBottom: "1.5rem" 
      }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1", minWidth: "200px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6c757d" }} />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "0.625rem 0.75rem 0.625rem 2.5rem", 
                border: "1px solid #ced4da",
                borderRadius: "8px",
                fontSize: "0.95rem"
              }}
            />
          </div>

          <select 
            value={selectedSector} 
            onChange={handleSectorChange} 
            style={{ 
              padding: "0.625rem 1rem", 
              border: "1px solid #ced4da",
              borderRadius: "8px",
              backgroundColor: "#fff",
              fontSize: "0.95rem",
              minWidth: "180px"
            }}
          >
            <option value="">All Sectors</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.sector_name || sector.name}
              </option>
            ))}
          </select>

          <button 
            type="submit" 
            style={{ 
              backgroundColor: "#3c6e71", 
              color: "#fff", 
              padding: "0.625rem 1.25rem", 
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Search size={16} />
            Search
          </button>
        </form>
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

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
          <Loader2 className="animate-spin" size={40} style={{ color: "#3c6e71" }} />
        </div>
      ) : companies.length === 0 ? (
        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: "12px", 
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
          padding: "3rem", 
          textAlign: "center" 
        }}>
          <Building size={48} style={{ color: "#adb5bd", marginBottom: "1rem" }} />
          <p style={{ color: "#6c757d", margin: 0 }}>No companies found.</p>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: "12px", 
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
          overflow: "hidden" 
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057", borderBottom: "2px solid #e9ecef" }}>Company</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057", borderBottom: "2px solid #e9ecef" }}>Email</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057", borderBottom: "2px solid #e9ecef" }}>City</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057", borderBottom: "2px solid #e9ecef" }}>Address</th>
                <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "#495057", borderBottom: "2px solid #e9ecef" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "1rem" }}>
                    <Link to={`/companies/${c.id}`} style={{ fontWeight: "600", color: "#3c6e71", textDecoration: "none" }}>
                      {c.company_oib || c.email}
                    </Link>
                  </td>
                  <td style={{ padding: "1rem", color: "#495057" }}>{c.email}</td>
                  <td style={{ padding: "1rem", color: "#495057" }}>{c.city}</td>
                  <td style={{ padding: "1rem", color: "#495057" }}>{c.address}</td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <Link to={`/apply/${c.id}`}>
                      <button style={{ 
                        backgroundColor: "#3c6e71", 
                        color: "#fff", 
                        border: "none", 
                        padding: "0.5rem 1rem", 
                        borderRadius: "6px", 
                        cursor: "pointer",
                        fontWeight: "500"
                      }}>
                        Apply
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}