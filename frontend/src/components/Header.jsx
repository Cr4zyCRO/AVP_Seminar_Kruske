import React from "react";

export default function Header({ user }) {
  return (
    <div className="header">
      <h1>📊 Dashboard</h1>
      <div className="user-info">
        <span>Jane Doe </span>
        <span style={{ marginLeft: "0.5rem", opacity: 0.8 }}>
          ({user.role})
        </span>
      </div>
    </div>
  );
}
