import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      className="window"
      style={{
        position: "absolute",
        left: "0",
        top: "0",
        zIndex: 10,
        width: "250px",
      }}
    >
      <div className="title-bar">
        <div className="title-bar-text">Menu</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body">
        <ul className="tree-view">
          <li
            onClick={() => {
              navigate("/");
              onClose();
            }}
          >
            Dashboard
          </li>
          <li>
            Tickets
            <ul>
              <li
                onClick={() => {
                  navigate("/tickets");
                  onClose();
                }}
              >
                View My Tickets
              </li>
              <li
                onClick={() => {
                  navigate("/tickets/new");
                  onClose();
                }}
              >
                Create New Ticket
              </li>
            </ul>
          </li>
          {isAdmin && (
            <li>
              Administration
              <ul>
                <li
                  onClick={() => {
                    navigate("/admin");
                    onClose();
                  }}
                >
                  Admin Dashboard
                </li>
                <li
                  onClick={() => {
                    navigate("/admin/tickets");
                    onClose();
                  }}
                >
                  Manage All Tickets
                </li>
              </ul>
            </li>
          )}
          <li
            onClick={() => {
              navigate("/profile");
              onClose();
            }}
          >
            My Profile
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
