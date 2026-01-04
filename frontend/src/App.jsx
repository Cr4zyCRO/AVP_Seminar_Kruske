import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";
import CompanyList from "./components/CompanyList"; 
import CompanyDetails from "./components/CompanyDetails";
import ApplicationForm from './components/ApplicationForm'; // Ključna linija

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
      } catch (e) {
        console.error("Greška pri dekodiranju tokena", e);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) return null; // Čekamo provjeru tokena

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
        <Route
          path="/companies"
          element={user ? <CompanyList /> : <Navigate to="/login" />}
        />
        {/* Ispravljeno: Zaštitili smo rutu za prijavu */}
        <Route 
          path="/apply/:companyId" 
          element={user ? <ApplicationForm /> : <Navigate to="/login" />} 
        />
        <Route
          path="/companies/:id"
          element={user ? <CompanyDetails /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;