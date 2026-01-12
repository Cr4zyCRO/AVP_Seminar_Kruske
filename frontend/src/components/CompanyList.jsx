import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";

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

  if (loading) return <p>Loading companies...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Company List</h2>

      {/* SEARCH + FILTERS */}
      <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />

        <select value={selectedSector} onChange={handleSectorChange} style={{ marginRight: "10px", padding: "5px" }}>
          <option value="">All Sectors</option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>

        <button type="submit" style={{ padding: "5px 15px" }}>Search</button>
      </form>

      {/* COMPANY TABLE */}
      {companies.length === 0 ? (
        <p>No companies available.</p>
      ) : (
        <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th style={{ padding: "10px" }}>Tax ID / Name</th>
              <th style={{ padding: "10px" }}>Email</th>
              <th style={{ padding: "10px" }}>City</th>
              <th style={{ padding: "10px" }}>Address</th>
              <th style={{ padding: "10px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>
                  <Link to={`/companies/${c.id}`} style={{ fontWeight: 'bold', color: '#007bff', textDecoration: 'none' }}>
                    {c.company_oib}
                  </Link>
                </td>
                <td style={{ padding: "10px" }}>{c.email}</td>
                <td style={{ padding: "10px" }}>{c.city}</td>
                <td style={{ padding: "10px" }}>{c.address}</td>
                <td style={{ padding: "10px" }}>
                  <Link to={`/apply/${c.id}`}>
                    <button style={{ 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}>
                      Apply
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}