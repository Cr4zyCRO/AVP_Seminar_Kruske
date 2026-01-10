import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Dashboard.css";

export default function Layout({ user, onLogout, children }) {
  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Sidebar role={user.role} onLogout={onLogout} />
      <div className="main-content">
        <Header user={user} />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
