import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicketById,
  updateTicket,
  addResponse,
} from "../services/ticketService";
import { getUsers } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import LoadingIndicator from "../components/LoadingIndicator";
import KnowledgeBasePanel from "../components/KnowledgeBasePanel";

const AdminTicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [ticket, setTicket] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [ticketUpdate, setTicketUpdate] = useState({
    status: "",
    priority: "",
    assignedTo: "",
  });

  useEffect(() => {
    fetchTicket();
    fetchUsers();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const handleTicketResponse = (data) => {
      if (data.ticket && data.ticket._id === id) {
        setTicket(data.ticket);
        setTicketUpdate({
          status: data.ticket.status,
          priority: data.ticket.priority,
          assignedTo: data.ticket.assignedTo?._id || "",
        });
      }
    };

    socket.on("updateTicket", handleTicketResponse);
    socket.on("ticketResponse", handleTicketResponse);

    return () => {
      socket.off("updateTicket", handleTicketResponse);
      socket.off("ticketResponse", handleTicketResponse);
    };
  }, [socket, id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const result = await getTicketById(id);
      setTicket(result.data);
      setTicketUpdate({
        status: result.data.status,
        priority: result.data.priority,
        assignedTo: result.data.assignedTo?._id || "",
      });
    } catch (err) {
      setError("Failed to load ticket details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers({ role: "admin" });
      if (response && response.data) {
        setUsers(response.data);
      } else {
        console.error("Unexpected response format from getUsers");
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
      setUsers([]);
    }
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updateTicket(id, ticketUpdate);
      await fetchTicket();
      setEditing(false);
    } catch (err) {
      setError("Failed to update ticket");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!response.trim()) return;

    try {
      setSubmitting(true);
      await addResponse(id, { text: response, isInternal });
      setResponse("");
      setIsInternal(false);
    } catch (err) {
      setError("Failed to submit response");
      console.error(err);
      await fetchTicket();
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">Loading Ticket...</div>
        </div>
        <div className="window-body">
          <LoadingIndicator
            message="Loading ticket details..."
            showSpinner={true}
          />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">Error</div>
        </div>
        <div className="window-body">
          <p className="error-message">{error || "Ticket not found"}</p>
          <button onClick={() => navigate("/admin/tickets")}>
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="title-bar">
        <div className="title-bar-text">
          Admin: Ticket #{ticket._id.slice(-5)}
        </div>
      </div>
      <div className="window-body">
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => navigate("/admin/tickets")}>
            Back to All Tickets
          </button>
        </div>

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {/* Left side: Ticket details and responses */}
          <div style={{ flex: "1 1 60%" }}>
            <div className="window" style={{ width: "100%" }}>
              <div className="title-bar">
                <div className="title-bar-text">Ticket Information</div>
              </div>
              <div className="window-body">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h3 style={{ margin: 0 }}>{ticket.title}</h3>
                  <button onClick={() => setEditing(!editing)}>
                    {editing ? "Cancel Edit" : "Edit Ticket"}
                  </button>
                </div>

                {!editing ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginBottom: "15px",
                    }}
                  >
                    <div>
                      <strong>Status:</strong>
                      <span
                        className={`status-badge status-${ticket.status.replace(
                          " ",
                          "-"
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <div>
                      <strong>Priority:</strong>
                      <span className={`priority-${ticket.priority}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div>
                      <strong>Category:</strong> {ticket.category}
                    </div>
                    <div>
                      <strong>Created:</strong>{" "}
                      {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>User:</strong> {ticket.user?.name || "Unknown"} (
                      {ticket.user?.email || "No email"})
                    </div>
                    <div>
                      <strong>Assigned To:</strong>{" "}
                      {ticket.assignedTo?.name || "Unassigned"}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateTicket}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "15px",
                        marginBottom: "15px",
                      }}
                    >
                      <div className="field-row-stacked">
                        <label htmlFor="status">Status</label>
                        <select
                          id="status"
                          name="status"
                          value={ticketUpdate.status}
                          onChange={handleInputChange}
                        >
                          <option value="open">Open</option>
                          <option value="in progress">In Progress</option>
                          <option value="solved">Solved</option>
                        </select>
                      </div>

                      <div className="field-row-stacked">
                        <label htmlFor="priority">Priority</label>
                        <select
                          id="priority"
                          name="priority"
                          value={ticketUpdate.priority}
                          onChange={handleInputChange}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>

                      <div className="field-row-stacked">
                        <label htmlFor="assignedTo">
                          Assign To (Admin only)
                        </label>
                        <select
                          id="assignedTo"
                          name="assignedTo"
                          value={ticketUpdate.assignedTo}
                          onChange={handleInputChange}
                        >
                          <option value="">Unassigned</option>
                          {users.map((admin) => (
                            <option key={admin._id} value={admin._id}>
                              {admin.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="button-row">
                      <button type="button" onClick={() => setEditing(false)}>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="default"
                      >
                        {submitting ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}

                <fieldset>
                  <legend>Description</legend>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {ticket.description}
                  </div>
                </fieldset>
              </div>
            </div>

            <div
              className="window"
              style={{ width: "100%", marginTop: "20px" }}
            >
              <div className="title-bar">
                <div className="title-bar-text">Ticket Responses</div>
              </div>
              <div className="window-body">
                {ticket.responses && ticket.responses.length > 0 ? (
                  ticket.responses.map((res, index) => (
                    <div
                      key={index}
                      className="window"
                      style={{
                        width: "100%",
                        marginBottom: "10px",
                        borderLeft: res.isInternal
                          ? "4px solid #AA5500"
                          : res.respondedBy._id === user.id
                          ? "4px solid #0000AA"
                          : "4px solid #AA0000",
                      }}
                    >
                      <div className="title-bar">
                        <div className="title-bar-text">
                          {res.respondedBy.name} ({res.respondedBy.role}) -{" "}
                          {new Date(res.createdAt).toLocaleString()}
                          {res.isInternal && " [INTERNAL NOTE]"}
                        </div>
                      </div>
                      <div className="window-body">
                        <div style={{ whiteSpace: "pre-wrap" }}>{res.text}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No responses yet.</p>
                )}

                <form onSubmit={handleSubmitResponse}>
                  <div className="field-row-stacked" style={{ width: "100%" }}>
                    <label htmlFor="response">Add Response</label>
                    <textarea
                      id="response"
                      rows="4"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                  <div className="field-row">
                    <input
                      id="internal-checkbox"
                      type="checkbox"
                      checked={isInternal}
                      onChange={() => setIsInternal(!isInternal)}
                    />
                    <label htmlFor="internal-checkbox">
                      Internal note (not visible to user)
                    </label>
                  </div>
                  <div className="button-row">
                    <button
                      type="submit"
                      disabled={submitting || !response.trim()}
                    >
                      {submitting ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          Submitting...
                          <div
                            className="progress-indicator"
                            style={{ width: "50px", display: "inline-block" }}
                          >
                            <span
                              className="progress-indicator-bar"
                              style={{ width: "80%" }}
                            />
                          </div>
                        </span>
                      ) : (
                        "Submit Response"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right side: Knowledge Base panel */}
          <div style={{ flex: "1 1 40%", maxHeight: "75vh" }}>
            {ticket && <KnowledgeBasePanel ticket={ticket} />}
          </div>
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">Ticket ID: {ticket._id}</p>
        <p className="status-bar-field">Status: {ticket.status}</p>
        <p className="status-bar-field">
          Last Updated: {new Date(ticket.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default AdminTicketDetail;
