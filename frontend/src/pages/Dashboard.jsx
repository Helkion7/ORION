import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../services/ticketService";
import { useAuth } from "../contexts/AuthContext";
import { FilePlus, ClipboardList, User } from "lucide-react";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Fetch only the latest tickets with a small limit
        const result = await getTickets({ limit: 5, sort: "-createdAt" });
        setTickets(result.data);
      } catch (err) {
        setError("Failed to fetch tickets");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="title-bar">
        <div className="title-bar-text">Dashboard</div>
      </div>
      <div className="window-body">
        <h2>Welcome back, {user?.name}!</h2>

        <div className="dashboard-grid">
          <div className="window" style={{ width: "100%" }}>
            <div className="title-bar">
              <div className="title-bar-text">Quick Actions</div>
            </div>
            <div className="window-body">
              <div className="desktop-icon-grid">
                <Link to="/tickets/new" className="desktop-icon">
                  <FilePlus
                    size={32}
                    className="win98-icon"
                    style={{ color: "#000", strokeWidth: 1 }}
                  />
                  <span>New Ticket</span>
                </Link>
                <Link to="/tickets" className="desktop-icon">
                  <ClipboardList
                    size={32}
                    className="win98-icon"
                    style={{ color: "#000", strokeWidth: 1 }}
                  />
                  <span>My Tickets</span>
                </Link>
                <Link to="/profile" className="desktop-icon">
                  <User
                    size={32}
                    className="win98-icon"
                    style={{ color: "#000", strokeWidth: 1 }}
                  />
                  <span>My Profile</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="window" style={{ width: "100%" }}>
            <div className="title-bar">
              <div className="title-bar-text">Recent Tickets</div>
            </div>
            <div className="window-body">
              {loading ? (
                <p>Loading recent tickets...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : tickets.length === 0 ? (
                <p>You have no tickets yet. Create your first ticket!</p>
              ) : (
                <div className="sunken-panel">
                  <table className="interactive">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket._id}
                          onClick={() => navigate(`/tickets/${ticket._id}`)}
                        >
                          <td>{ticket._id.slice(-5)}</td>
                          <td>{ticket.title}</td>
                          <td>
                            <span
                              className={`status-badge status-${ticket.status.replace(
                                " ",
                                "-"
                              )}`}
                            >
                              {ticket.status}
                            </span>
                          </td>
                          <td>
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ marginTop: "10px", textAlign: "right" }}>
                <Link to="/tickets">
                  <button>View all tickets</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">User: {user?.name}</p>
        <p className="status-bar-field">Role: {user?.role}</p>
      </div>
    </div>
  );
};

export default Dashboard;
