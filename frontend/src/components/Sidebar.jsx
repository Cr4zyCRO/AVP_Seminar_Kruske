import React from "react";
import axios from "axios";

export default function Sidebar({ role, onLogout }) {
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    console.log("Logging out with token:", token);

    if (token) {
      try {
        await axios.post("http://localhost:5000/auth/logout", {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Logout error:", err);
      }
    }

    localStorage.removeItem("token");
    onLogout();
  };

  return (
    <div className="sidebar">
      <h3>Menu</h3>
      <ul>
        <li>🏠 Home</li>

        {role === "admin" && <li>🛠 Admin Panel</li>}
        {role === "faculty" && <li>🏫 Faculty Panel</li>}
        {role === "student" && <li>📄 My Applications</li>}
        {role === "company" && <li>🏢 Company Dashboard</li>}

        <li>👤 Profile</li>
        <li>⚙️ Settings</li>

        <li
          onClick={handleLogout}
          style={{ cursor: "pointer", color: "#ffb4b4" }}
        >
          🚪 Logout
        </li>
      </ul>
    </div>
  );
}
