import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTicketStats, getTickets } from "../services/ticketService";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch statistics
        const statsResult = await getTicketStats();
        setStats(statsResult.data);

        // Fetch recent tickets
        const ticketsResult = await getTickets({
          limit: 5,
          sort: "-createdAt",
        });
        setRecentTickets(ticketsResult.data);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatStatusStats = (statusStats) => {
    if (!statusStats) return [];

    // Create a complete array with all possible statuses
    const statuses = ["open", "in progress", "solved"];
    return statuses.map((status) => {
      const found = statusStats.find((s) => s._id === status);
      return {
        status,
        count: found ? found.count : 0,
      };
    });
  };

  const formatCategoryStats = (categoryStats) => {
    if (!categoryStats) return [];
    return categoryStats || [];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "#ffcc00";
      case "in progress":
        return "#66ccff";
      case "solved":
        return "#66cc66";
      default:
        return "#e0e0e0";
    }
  };

  if (loading) {
    return (
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">Admin Dashboard</div>
        </div>
        <div className="window-body">
          <div className="loading-overlay">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">Admin Dashboard</div>
        </div>
        <div className="window-body">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="title-bar">
        <div className="title-bar-text">Admin Dashboard</div>
      </div>
      <div className="window-body">
        <h2>Admin Control Panel</h2>

        <div className="dashboard-grid">
          {/* Quick Actions */}
          <div className="window" style={{ width: "100%" }}>
            <div className="title-bar">
              <div className="title-bar-text">Quick Actions</div>
            </div>
            <div className="window-body">
              <div className="desktop-icon-grid">
                <Link to="/admin/tickets" className="desktop-icon">
                  <img
                    src="https://i.imgur.com/cxTwSkA.png"
                    alt="All Tickets"
                  />
                  <span>All Tickets</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Status Statistics */}
          <div className="window" style={{ width: "100%" }}>
            <div className="title-bar">
              <div className="title-bar-text">Ticket Status</div>
            </div>
            <div className="window-body">
              <div className="stats-container">
                {stats &&
                  formatStatusStats(stats.statusStats).map((item) => (
                    <div
                      key={item.status}
                      className="window"
                      style={{ margin: "5px" }}
                    >
                      <div
                        className="title-bar"
                        style={{ backgroundColor: getStatusColor(item.status) }}
                      >
                        <div className="title-bar-text">{item.status}</div>
                      </div>
                      <div
                        className="window-body"
                        style={{ textAlign: "center", padding: "10px" }}
                      >
                        <h2 style={{ margin: "0" }}>{item.count}</h2>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tickets Section */}
        <div className="window" style={{ width: "100%", marginTop: "20px" }}>
          <div className="title-bar">
            <div className="title-bar-text">Recent Tickets</div>
          </div>
          <div className="window-body">
            {recentTickets.length === 0 ? (
              <p>No tickets found in the system.</p>
            ) : (
              <div className="sunken-panel" style={{ height: "250px" }}>
                <table className="interactive">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map((ticket) => (
                      <tr
                        key={ticket._id}
                        onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                      >
                        <td>{ticket._id.slice(-5)}</td>
                        <td>{ticket.user?.name || "Unknown"}</td>
                        <td>{ticket.title}</td>
                        <td>{ticket.category}</td>
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
                        <td className={`priority-${ticket.priority}`}>
                          {ticket.priority}
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
              <Link to="/admin/tickets">
                <button>View all tickets</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="window" style={{ width: "100%", marginTop: "20px" }}>
          <div className="title-bar">
            <div className="title-bar-text">Ticket Categories</div>
          </div>
          <div className="window-body">
            <div className="sunken-panel">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {stats &&
                    formatCategoryStats(stats.categoryStats).map((item) => (
                      <tr key={item._id}>
                        <td>{item._id}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">Admin Dashboard</p>
        <p className="status-bar-field">
          Total Tickets:{" "}
          {stats?.statusStats?.reduce((acc, curr) => acc + curr.count, 0) || 0}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
