import React from "react";
import { FaChartBar } from "react-icons/fa";

export default function Header({ user }) {
  return (
    <div className="header">
      <h1>
        <FaChartBar style={{ marginRight: "0.5rem" }} />
        Dashboard
      </h1>
      <div className="user-info">
        <span>{user.email}</span>
        <span style={{ marginLeft: "0.5rem", opacity: 0.8 }}>
          ({user.role})
        </span>
      </div>
    </div>
  );
}
