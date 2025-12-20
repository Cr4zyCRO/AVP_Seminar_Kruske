import { useEffect, useState } from "react";
import axios from "axios";

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [sectors, setSectors] = useState([]); // lista sektora
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState(""); // odabrani sektor
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dohvat sektora (dropdown)
  const fetchSectors = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/sectors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSectors(res.data);
    } catch (err) {
      console.error("Greška pri dohvaćanju sektora", err);
    }
  };

  // Dohvat kompanija s backend-a (search + sektor)
  const fetchCompanies = async (searchValue = "", sectorId = "") => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/companies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: searchValue,
          sectorId: sectorId || undefined, // šaljemo samo ako postoji
        },
      });

      setCompanies(res.data.data || res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Greška pri dohvaćanju kompanija"
      );
    } finally {
      setLoading(false);
    }
  };

  // Inicijalni fetch
  useEffect(() => {
    fetchSectors();
    fetchCompanies();
  }, []);

  // Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(search, selectedSector);
  };

  // Promjena sektora (odmah filtrira)
  const handleSectorChange = (e) => {
    const sectorId = e.target.value;
    setSelectedSector(sectorId);
    fetchCompanies(search, sectorId);
  };

  // LOADING STATE
  if (loading) {
    return <p>Učitavanje kompanija...</p>;
  }

  // ERROR STATE
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h2>Popis kompanija</h2>

      {/* SEARCH + FILTERI */}
      <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Pretraži kompanije..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* SECTOR DROPDOWN */}
        <select value={selectedSector} onChange={handleSectorChange}>
          <option value="">Svi sektori</option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>

        <button type="submit">Traži</button>
      </form>

      {/* LISTA KOMPANIJA */}
      {/* LISTA KOMPANIJA */}
{companies.length === 0 ? (
  <p>Nema dostupnih kompanija.</p>
) : (
  <table>
    <thead>
      <tr>
        <th>OIB</th>
        <th>Email</th>
        <th>Grad</th>
        <th>Adresa</th>
        <th>Akcija</th> {/* Dodali smo zaglavlje za gumb */}
      </tr>
    </thead>
    <tbody>
      {companies.map((company) => (
        <tr key={company.id}>
          <td>
            {/* Možete kliknuti izravno na OIB za detalje */}
            <Link to={`/companies/${company.id}`} style={{ fontWeight: 'bold', color: '#007bff' }}>
              {company.company_oib}
            </Link>
          </td>
          <td>{company.email}</td>
          <td>{company.city}</td>
          <td>{company.address}</td>
          <td>
            {/* Ili dodati poseban gumb/link na kraju reda */}
            <Link to={`/companies/${company.id}`}>
              <button>Prikaži detalje</button>
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
