import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LoginForm from "./components/LoginForm";
import CompanyList from "./components/CompanyList"; 
import CompanyDetails from "./components/CompanyDetails";
import ApplicationForm from './components/ApplicationForm';
import MyApplications from './components/MyApplications';
import ApplicationApproval from './components/ApplicationApproval';
import Dashboard from "./components/Dashboard";
import AdminUsers from './components/AdminUsers';
import Settings from './components/Settings';
import PracticeReport from './components/PracticeReport';
import FacultyReportReview from './components/FacultyReportReview';
import Certificates from "./components/Certificates";
import WorkDiary from "./components/WorkDiary";

import Profile from "./components/Profile";

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
        <Route path="/" element= {<Navigate to="/login" replace/>}/>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <LoginForm setUser={setUser} />}
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Dashboard user={user} onLogout={handleLogout}/>
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
          path="/settings"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Settings user={user} />
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
        <Route
          path="/practice-report"
          element={
            user && user.role === "student" ? (
              <Layout user={user} onLogout={handleLogout}>
                <PracticeReport />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/work-diary"
          element={
            user && user.role === "student" ? (
              <Layout user={user} onLogout={handleLogout}>
                <WorkDiary />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/faculty/reports"
          element={
            user && (user.role === "professor" || user.role === "admin") ? (
              <Layout user={user} onLogout={handleLogout}>
                <FacultyReportReview />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/certificates"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Certificates user={user} onLogout={handleLogout}/>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/my-applications"
          element={
            user && user.role === "student" ? (
              <Layout user={user} onLogout={handleLogout}>
                <MyApplications />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/faculty/applications"
          element={
            user && (user.role === "faculty" || user.role === "professor" || user.role === "admin") ? (
              <Layout user={user} onLogout={handleLogout}>
                <ApplicationApproval />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Profile />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>
    </Router>
  );
}

export default App;