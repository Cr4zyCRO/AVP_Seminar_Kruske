import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <LoginForm setUser={setUser} />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
