import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTickets } from "../services/ticketService";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all, open, in progress, solved

  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, [page, filter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Set up filter params
      const params = { page, limit: 10 };
      if (filter !== "all") {
        params.status = filter;
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
    setFilter(e.target.value);
    setPage(1); // Reset to first page when changing filters
  };

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="title-bar">
        <div className="title-bar-text">My Support Tickets</div>
      </div>
      <div className="window-body">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
          }}
        >
          <div className="field-row">
            <label htmlFor="status-filter">Filter by status:</label>
            <select
              id="status-filter"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="solved">Solved</option>
            </select>
          </div>

          <div>
            <Link to="/tickets/new">
              <button>Create New Ticket</button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay">Loading tickets...</div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>You don't have any tickets yet.</p>
            <Link to="/tickets/new">
              <button className="default" style={{ marginTop: "10px" }}>
                Create Your First Ticket
              </button>
            </Link>
          </div>
        ) : (
          <div className="sunken-panel" style={{ height: "400px" }}>
            <table className="interactive">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                  <th>Last Updated</th>
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
                    <td>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
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
      </div>
    </div>
  );
};

export default Tickets;
