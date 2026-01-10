import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LoginForm from "./components/LoginForm";
import CompanyList from "./components/CompanyList"; 
import CompanyDetails from "./components/CompanyDetails";
import ApplicationForm from './components/ApplicationForm';
import AdminUsers from './components/AdminUsers';

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

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <LoginForm setUser={setUser} />}
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <h2>Welcome back, {user.role}</h2>
                <p>Your personalized dashboard is ready.</p>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/companies"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <CompanyList />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route 
          path="/admin/users" 
          element={
            user && user.role === "admin" ? (
              <Layout user={user} onLogout={handleLogout}>
                <AdminUsers />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route 
          path="/apply/:companyId" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <ApplicationForm />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/companies/:id"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <CompanyDetails />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;