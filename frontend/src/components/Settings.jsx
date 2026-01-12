import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Settings.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setUpdating(true);
    try {
      await axios.put(
        `${API_URL}/users/me`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="settings-loading">Loading...</div>;

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      
      {/* Profile Info Card */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Profile Information</h3>
        </div>
        <div className="card-body">
          {profile ? (
            <div className="profile-grid">
              <div className="profile-item">
                <label>First Name</label>
                <span>{profile.firstname}</span>
              </div>
              <div className="profile-item">
                <label>Last Name</label>
                <span>{profile.lastname}</span>
              </div>
              <div className="profile-item">
                <label>Email</label>
                <span>{profile.email}</span>
              </div>
              <div className="profile-item">
                <label>Role</label>
                <span className={`role-badge role-${profile.role}`}>{profile.role}</span>
              </div>
              <div className="profile-item">
                <label>JMBAG</label>
                <span>{profile.jmbag}</span>
              </div>
              <div className="profile-item">
                <label>OIB</label>
                <span>{profile.oib}</span>
              </div>
            </div>
          ) : (
            <p>Could not load profile</p>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Change Password</h3>
        </div>
        <div className="card-body">
          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="password-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter your current password"
              />
            </div>
            
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat new password"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <span className="field-error">Passwords do not match</span>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <span className="field-success">Passwords match ✓</span>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-save" 
                disabled={updating || newPassword !== confirmPassword}
              >
                {updating ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
