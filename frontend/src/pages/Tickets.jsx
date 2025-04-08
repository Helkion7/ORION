import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTickets } from "../services/ticketService";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import LoadingIndicator from "../components/LoadingIndicator";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all, open, in progress, solved
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, [page, filter, sortField, sortDirection]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new tickets
    const handleNewTicket = (data) => {
      // Only add the ticket if it belongs to the current user
      if (data.ticket.user && data.ticket.user._id === user.id) {
        setTickets((prevTickets) => {
          // If we're on the first page, add the ticket to the list
          if (page === 1) {
            // Check if the ticket already exists
            const exists = prevTickets.some((t) => t._id === data.ticket._id);
            if (!exists) {
              // Apply filter
              if (filter === "all" || data.ticket.status === filter) {
                // Add new ticket to the beginning
                return [data.ticket, ...prevTickets.slice(0, -1)];
              }
            }
          }
          return prevTickets;
        });
      }
    };

    // Listen for ticket updates
    const handleUpdateTicket = (data) => {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === data.ticket._id ? data.ticket : ticket
        )
      );
    };

    // Listen for ticket responses
    const handleTicketResponse = (data) => {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === data.ticket._id ? data.ticket : ticket
        )
      );
    };

    socket.on("newTicket", handleNewTicket);
    socket.on("updateTicket", handleUpdateTicket);
    socket.on("ticketResponse", handleTicketResponse);

    return () => {
      socket.off("newTicket", handleNewTicket);
      socket.off("updateTicket", handleUpdateTicket);
      socket.off("ticketResponse", handleTicketResponse);
    };
  }, [socket, user?.id, page, filter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Set up filter params
      const params = {
        page,
        limit: 10,
        sort: `${sortDirection === "desc" ? "-" : ""}${sortField}`,
      };

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

  const handleSort = (field) => {
    // If clicking the same field, toggle direction
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new field, set it as the sort field with default desc direction
      setSortField(field);
      setSortDirection("desc");
    }
    setPage(1); // Reset to first page when changing sort
  };

  // Helper to render sort class
  const getSortClass = (field) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? "sort-asc" : "sort-desc";
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
          <LoadingIndicator
            message="Loading your tickets..."
            segmented={true}
          />
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
          <div
            className="sunken-panel"
            style={{
              height: "calc(65vh - 200px)",
              minHeight: "300px",
            }}
          >
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
                    onClick={() => handleSort("category")}
                    className={getSortClass("category")}
                  >
                    Category
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className={getSortClass("status")}
                  >
                    Status
                  </th>
                  <th
                    onClick={() => handleSort("priority")}
                    className={getSortClass("priority")}
                  >
                    Priority
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className={getSortClass("createdAt")}
                  >
                    Created
                  </th>
                  <th
                    onClick={() => handleSort("updatedAt")}
                    className={getSortClass("updatedAt")}
                  >
                    Last Updated
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
