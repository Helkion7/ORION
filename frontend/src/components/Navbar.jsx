import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="window" style={{ marginBottom: "10px" }}>
      <div className="title-bar">
        <div className="title-bar-text">
          ORION Support System - {user?.name} [{user?.role}]
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close" onClick={handleLogout}></button>
        </div>
      </div>
      <div
        className="window-body"
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px",
        }}
      >
        <div>
          <button onClick={onMenuToggle}>Menu</button>
          <button onClick={() => navigate("/")} style={{ marginLeft: "8px" }}>
            Home
          </button>
          <button
            onClick={() => navigate("/tickets")}
            style={{ marginLeft: "8px" }}
          >
            My Tickets
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              style={{ marginLeft: "8px" }}
            >
              Admin Panel
            </button>
          )}
        </div>
        <div>
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={handleLogout} style={{ marginLeft: "8px" }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
