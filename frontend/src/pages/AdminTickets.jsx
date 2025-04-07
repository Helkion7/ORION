import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTickets } from "../services/ticketService";

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, [page, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Set up filter params
      const params = { page, limit: 15 };

      if (filters.status !== "all") {
        params.status = filters.status;
      }

      if (filters.priority !== "all") {
        params.priority = filters.priority;
      }

      if (filters.category !== "all") {
        params.category = filters.category;
      }

      const result = await getTickets(params);
      setTickets(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError("Failed to load tickets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1); // Reset to first page when changing filters
  };

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="title-bar">
        <div className="title-bar-text">All Support Tickets</div>
      </div>
      <div className="window-body">
        {/* Filters */}
        <div className="window" style={{ width: "100%", marginBottom: "15px" }}>
          <div className="title-bar">
            <div className="title-bar-text">Filters</div>
          </div>
          <div
            className="window-body"
            style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
          >
            <div className="field-row">
              <label htmlFor="status">Status:</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="solved">Solved</option>
              </select>
            </div>

            <div className="field-row">
              <label htmlFor="priority">Priority:</label>
              <select
                id="priority"
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="field-row">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Network</option>
                <option value="Security">Security</option>
                <option value="Account">Account</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button onClick={fetchTickets}>Apply Filters</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay">Loading tickets...</div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>No tickets found matching your criteria.</p>
          </div>
        ) : (
          <div className="sunken-panel" style={{ height: "400px" }}>
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
                  <th>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
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
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>{ticket.assignedTo?.name || "Unassigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {!loading && tickets.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            <button
              disabled={!pagination.prev}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              disabled={!pagination.next}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <div className="status-bar">
        <p className="status-bar-field">Total: {tickets.length} tickets</p>
        {pagination.total && (
          <p className="status-bar-field">
            Total in database: {pagination.total}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminTickets;
