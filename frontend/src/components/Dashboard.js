import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Dashboard.css";

export default function Dashboard({ user }) {
  return (
    <div className="dashboard-container">
      <Sidebar role={user.role} />
      <div className="main-content">
        <Header user={user} />
        <div className="content">
          <h2>Welcome!</h2>
          <p>This is your dashboard. You can add widgets, tables, charts, etc.</p>
        </div>
      </div>
    </div>
  );
}
