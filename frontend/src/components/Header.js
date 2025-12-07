import React from "react";

export default function Header({ user }) {
  return (
    <div className="header">
      <h1>Dashboard</h1>
      <div className="user-info">
        <span>{user.firstname} {user.lastname}</span>
        <span>({user.role})</span>
      </div>
    </div>
  );
}
