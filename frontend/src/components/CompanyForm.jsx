import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CompanyForm.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function CompanyForm() {
  const token = localStorage.getItem("token");

  const [companies, setCompanies] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    company_oib: "",
    email: "",
    address: "",
    city: "",
    owner_id: "",
    sector_id: "",
  });

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch companies, mentors and sectors
  useEffect(() => {
    fetchCompanies();
    axios
      .get(`${API}/users/mentors`, { headers })
      .then((res) => setMentors(res.data))
      .catch((err) => console.error("Failed to fetch mentors", err));

    axios
      .get(`${API}/sectors`, { headers })
      .then((res) => setSectors(res.data))
      .catch((err) => console.error("Failed to fetch sectors", err));
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API}/companies`, { headers });
      setCompanies(res.data.data);
    } catch (err) {
      console.error("Failed to fetch companies", err);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      company_oib: "",
      email: "",
      address: "",
      city: "",
      owner_id: "",
      sector_id: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    setError(null);
    e.preventDefault();
    try {
      if (!form.owner_id || !form.sector_id) {
        setError("Owner and Sector are required!");
        return;
      }
      if (editing) {
        await axios.put(`${API}/companies/${editing.id}`, form, { headers });
      } else {
        await axios.post(`${API}/companies`, form, { headers });
      }
      setShowModal(false);
      fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save company");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <h2>Company Management</h2>
        <button className="btn-create" onClick={openCreate}>
          + New Company
        </button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>OIB</th>
            <th>Email</th>
            <th>City</th>
            <th>Owner</th>
            <th>Sector</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.id}>
              <td>{c.company_oib}</td>
              <td>{c.email}</td>
              <td>{c.city}</td>
              <td>
                {(() => {
                  const owner = mentors.find((m) => m?.id === c.owner_id);
                  return owner
                    ? `${owner.firstname} ${owner.lastname}`
                    : c.owner_id;
                })()}
              </td>
              <td>
                {sectors.find((f) => f?.id == c.sector_id)?.sector_name ||
                  c.sector_id}
              </td>
              <td>
                <button
                  className="btn-edit"
                  onClick={() => {
                    setEditing(c);
                    setForm(c);
                    setShowModal(true);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit Company" : "New Company"}</h3>
            <span>{error && <div className="error-message">{error}</div>}</span>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>OIB</label>
                  <input
                    type="text"
                    name="company_oib"
                    value={form.company_oib}
                    onChange={handleInputChange}
                    required
                    maxLength="11"
                    pattern="\d{11}"
                    title="OIB must be 11 digits"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Owner (Mentor)</label>
                  <select
                    name="owner_id"
                    value={form.owner_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Mentor Owner</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.firstname} {m.lastname} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sector</label>
                  <select
                    name="sector_id"
                    value={form.sector_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Sector</option>
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.sector_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowModal(false);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editing ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
