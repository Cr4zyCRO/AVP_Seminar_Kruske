import Header from "./Header";
import "./Dashboard.css";
import Sidebar from "./Sidebar";

export default function Dashboard({ user }) {
  if (!user) return null;

  return (
    <div>
      <div>
        <div>
          <h2>Welcome back, {user.role} </h2>
          <p>Your personalized dashboard is ready.</p>
        </div>
      </div>
    </div>
  );
}
