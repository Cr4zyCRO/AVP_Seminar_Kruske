import React, { useEffect, useState } from "react";
import axios from "axios";


const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Greška pri učitavanju podataka profila");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setError("Token nije pronađen, molimo prijavite se.");
      setLoading(false);
    }
  }, [token]);

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Učitavanje profila...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '5rem', color: '#007bff', marginBottom: '1rem' }}>👤</div>
        <h2>Moj Profil</h2>
        
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', padding: '2rem' }}>
        {profile ? (
          <div>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>Ime</label>
                <span style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>{profile.firstname}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>Prezime</label>
                <span style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>{profile.lastname}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>Email adresa</label>
              <span style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>{profile.email}</span>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>Uloga</label>
                <span style={{ 
                  background: '#daebff', 
                  color: '#007bff', 
                  padding: '5px 15px', 
                  borderRadius: '20px', 
                  fontWeight: 'bold',
                  width: 'fit-content' 
                }}>
                  {profile.role}
                </span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>Član od</label>
                <span style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                  {new Date(profile.is_created).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>JMBAG</label>
                <span style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>{profile.jmbag || "N/A"}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>OIB</label>
                <span style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>{profile.oib || "N/A"}</span>
              </div>
            </div>
          </div>
        ) : (
          <p>Podaci o profilu nisu dostupni.</p>
        )}
      </div>
    </div>
  );
}