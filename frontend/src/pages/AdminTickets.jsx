import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTickets } from "../services/ticketService";
import { useSocket } from "../contexts/SocketContext";
import LoadingIndicator from "../components/LoadingIndicator";

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
    role: "all",
    searchTerm: "",
  });
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    fetchTickets();
  }, [page, filters, sortField, sortDirection]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new tickets
    const handleNewTicket = (data) => {
      // For admin, show all new tickets that match current filters
      setTickets((prevTickets) => {
        // If we're on the first page and the ticket matches our filters, add it
        if (page === 1) {
          // Check if the ticket already exists
          const exists = prevTickets.some((t) => t._id === data.ticket._id);
          if (!exists) {
            // Apply filters
            let matchesFilters = true;

            if (
              filters.status !== "all" &&
              data.ticket.status !== filters.status
            ) {
              matchesFilters = false;
            }

            if (
              filters.priority !== "all" &&
              data.ticket.priority !== filters.priority
            ) {
              matchesFilters = false;
            }

            if (
              filters.category !== "all" &&
              data.ticket.category !== filters.category
            ) {
              matchesFilters = false;
            }

            if (matchesFilters) {
              // Add new ticket to the beginning
              return [data.ticket, ...prevTickets.slice(0, -1)];
            }
          }
        }
        return prevTickets;
      });
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
  }, [socket, page, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Set up filter params
      const params = {
        page,
        limit: 15,
        sort: `${sortDirection === "desc" ? "-" : ""}${sortField}`,
      };

      if (filters.status !== "all") {
        params.status = filters.status;
      }

      if (filters.priority !== "all") {
        params.priority = filters.priority;
      }

      if (filters.category !== "all") {
        params.category = filters.category;
      }

      if (filters.role !== "all") {
        params.role = filters.role;
      }

      if (filters.searchTerm) {
        params.search = filters.searchTerm;
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

  // Helper to render sort indicator
  const getSortClass = (field) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? "sort-asc" : "sort-desc";
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
            <div className="title-bar-text">Search & Filters</div>
          </div>
          <div
            className="window-body"
            style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
          >
            <div className="field-row" style={{ flex: "1" }}>
              <label htmlFor="searchTerm">Search:</label>
              <input
                id="searchTerm"
                name="searchTerm"
                type="text"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search tickets..."
                style={{ flex: "1" }}
              />
            </div>

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

            <div className="field-row">
              <label htmlFor="role">Assigned To:</label>
              <select
                id="role"
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="unassigned">Unassigned</option>
                <option value="admin">Admin</option>
                <option value="firstLineSupport">First Line Support</option>
                <option value="secondLineSupport">Second Line Support</option>
              </select>
            </div>

            <button onClick={fetchTickets}>Apply Filters</button>
            <button
              onClick={() => {
                setFilters({
                  status: "all",
                  priority: "all",
                  category: "all",
                  role: "all",
                  searchTerm: "",
                });
                setPage(1);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingIndicator message="Loading tickets..." segmented={true} />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>No tickets found matching your criteria.</p>
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
                    onClick={() => handleSort("user.name")}
                    className={getSortClass("user.name")}
                  >
                    User
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
                    onClick={() => handleSort("assignedTo.name")}
                    className={getSortClass("assignedTo.name")}
                  >
                    Assigned To
                  </th>
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
