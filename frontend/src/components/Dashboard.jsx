import Header from "./Header";
import "./Dashboard.css";
import Sidebar from "./Sidebar";

export default function Dashboard({ user, onLogout }) {
  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Sidebar role={user.role} onLogout={onLogout} />
      <div className="main-content">
        <Header user={user} />
        <div className="content">
          <h2>Welcome back, {user.role} </h2>
          <p>Your personalized dashboard is ready.</p>
        </div>
      </div>
    </div>
  );
}
