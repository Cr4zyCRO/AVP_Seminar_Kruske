import React from "react";
import axios from "axios";
import {
  FaHome,
  FaTools,
  FaSchool,
  FaFileAlt,
  FaBuilding,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar({ role, onLogout }) {
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    console.log("Logging out with token:", token);

    if (token) {
      try {
        await axios.post(
          "http://localhost:5000/auth/logout",
          null,
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
        <li><FaHome style={{ marginRight: 8 }} /> Home</li>

        {role === "admin" && <li><FaTools style={{ marginRight: 8 }} /> Admin Panel</li>}
        {role === "faculty" && <li><FaSchool style={{ marginRight: 8 }} /> Faculty Panel</li>}
        {role === "student" && <li><FaFileAlt style={{ marginRight: 8 }} /> My Applications</li>}
        {role === "company" && <li><FaBuilding style={{ marginRight: 8 }} /> Company Dashboard</li>}

        <li><FaUser style={{ marginRight: 8 }} /> Profile</li>
        <li><FaCog style={{ marginRight: 8 }} /> Settings</li>

        <li
          onClick={handleLogout}
          style={{ cursor: "pointer", color: "#ffb4b4" }}
        >
          <FaSignOutAlt style={{ marginRight: 8 }} /> Logout
        </li>
      </ul>
    </div>
  );
} 