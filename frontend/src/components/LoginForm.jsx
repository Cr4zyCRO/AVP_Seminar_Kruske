import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginForm.css";


const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function LoginForm({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const data = res.data;

      localStorage.setItem("token", data.token);
      setUser(JSON.parse(atob(data.token.split(".")[1])));

      // Navigate to dashboard after login
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
