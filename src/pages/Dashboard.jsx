import { useNavigate } from "react-router-dom";
import { logout } from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("Logout button clicked");

    try {
      console.log("Calling logout API...");
      const res = await logout();
      console.log("Logout API response:", res);
    } catch (err) {
      console.error("Logout API error:", err?.response?.data || err.message);
    } finally {
      localStorage.removeItem("token");
      console.log("Token after remove:", localStorage.getItem("token"));
      navigate("/login");
    }
  };

  return (
    <>
      <div>Welcome to the Dashboard</div>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
};

export default Dashboard;
