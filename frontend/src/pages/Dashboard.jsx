import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTickets } from "../services/ticketService";
import { useAuth } from "../contexts/AuthContext";
import { useSocket, useSocketWithError } from "../contexts/SocketContext";
import { FilePlus, ClipboardList, User } from "lucide-react";
import LoadingIndicator from "../components/LoadingIndicator";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const { connectionError } = useSocketWithError();

  useEffect(() => {
    if (connectionError) {
      console.warn("Socket connection error in Dashboard:", connectionError);
      // Optionally show this error to the user or handle it as needed
    }
  }, [connectionError]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const result = await getTickets({
          limit: 5,
          sort: `${sortDirection === "desc" ? "-" : ""}${sortField}`,
        });
        setTickets(result.data);
      } catch (err) {
        setError("Failed to fetch tickets");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [sortField, sortDirection]);

  useEffect(() => {
    if (!socket) return;

    const handleNewTicket = (data) => {
      if (data.ticket.user && data.ticket.user._id === user.id) {
        setTickets((prevTickets) => {
          const exists = prevTickets.some((t) => t._id === data.ticket._id);
          if (!exists) {
            return [data.ticket, ...prevTickets.slice(0, 4)];
          }
          return prevTickets;
        });
      }
    };

    const handleUpdateTicket = (data) => {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === data.ticket._id ? data.ticket : ticket
        )
      );
    };

    socket.on("newTicket", handleNewTicket);
    socket.on("updateTicket", handleUpdateTicket);
    socket.on("ticketResponse", handleUpdateTicket);

    return () => {
      socket.off("newTicket", handleNewTicket);
      socket.off("updateTicket", handleUpdateTicket);
      socket.off("ticketResponse", handleUpdateTicket);
    };
  }, [socket, user?.id]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortClass = (field) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? "sort-asc" : "sort-desc";
  };

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="title-bar">
        <div className="title-bar-text">Dashboard</div>
      </div>
      <div className="window-body">
        <h2>Welcome back, {user?.name}!</h2>

        {connectionError && (
          <div
            className="window"
            style={{ marginBottom: "15px", border: "2px solid #ff0000" }}
          >
            <div className="title-bar" style={{ backgroundColor: "#ff0000" }}>
              <div className="title-bar-text">Connection Error</div>
            </div>
            <div className="window-body">
              <p>Real-time updates are not available: {connectionError}</p>
              <p>You'll need to refresh the page manually to see updates.</p>
            </div>
          </div>
        )}

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
                <LoadingIndicator
                  message="Loading recent tickets..."
                  segmented={false}
                  showSpinner={true}
                />
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : tickets.length === 0 ? (
                <p>You have no tickets yet. Create your first ticket!</p>
              ) : (
                <div className="sunken-panel">
                  <table className="interactive">
                    <thead>
                      <tr>
                        <th
                          onClick={() => handleSort("_id")}
                          className={getSortClass("_id")}
                        >
                          ID
                        </th>
                        <th
                          onClick={() => handleSort("title")}
                          className={getSortClass("title")}
                        >
                          Title
                        </th>
                        <th
                          onClick={() => handleSort("status")}
                          className={getSortClass("status")}
                        >
                          Status
                        </th>
                        <th
                          onClick={() => handleSort("createdAt")}
                          className={getSortClass("createdAt")}
                        >
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket._id}
                          onClick={() =>
                            navigate(
                              user?.role === "admin"
                                ? `/admin/tickets/${ticket._id}`
                                : `/tickets/${ticket._id}`
                            )
                          }
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
