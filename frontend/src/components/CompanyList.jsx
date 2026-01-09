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

  // Dohvat sektora za dropdown
  const fetchSectors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/sectors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSectors(res.data);
    } catch (err) {
      console.error("Greška pri dohvaćanju sektora", err);
    }
  };

  // Dohvat kompanija (search + filter)
  const fetchCompanies = async (searchValue = "", sectorId = "") => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/companies", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchValue,
          sectorId: sectorId || undefined,
        },
      });
      setCompanies(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Greška pri dohvaćanju kompanija");
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

  if (loading) return <p>Učitavanje kompanija...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Popis kompanija</h2>

      {/* SEARCH + FILTERI */}
      <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Pretraži kompanije..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />

        <select value={selectedSector} onChange={handleSectorChange} style={{ marginRight: "10px", padding: "5px" }}>
          <option value="">Svi sektori</option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>

        <button type="submit" style={{ padding: "5px 15px" }}>Traži</button>
      </form>

      {/* LISTA KOMPANIJA */}
      {companies.length === 0 ? (
        <p>Nema dostupnih kompanija.</p>
      ) : (
        <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th style={{ padding: "10px" }}>OIB / Naziv</th>
              <th style={{ padding: "10px" }}>Email</th>
              <th style={{ padding: "10px" }}>Grad</th>
              <th style={{ padding: "10px" }}>Adresa</th>
              <th style={{ padding: "10px" }}>Akcija</th>
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
                      Prijavi se
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