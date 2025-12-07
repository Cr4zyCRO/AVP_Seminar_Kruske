import React from "react";

export default function Sidebar({ role }) {
  return (
    <div className="sidebar">
      <h3>Menu</h3>
      <ul>
        <li>Home</li>
        {role === "admin" && <li>Admin Panel</li>}
        {role === "faculty" && <li>Faculty Panel</li>}
        {role === "student" && <li>My Applications</li>}
        {role === "company" && <li>Company Dashboard</li>}
        <li>Profile</li>
        <li>Settings</li>
        <li>Logout</li>
      </ul>
    </div>
  );
}
