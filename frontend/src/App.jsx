import React, { useEffect, useState } from "react";
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

  return (
    <div>
      {user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <LoginForm />}
    </div>
  );
}

export default App;
