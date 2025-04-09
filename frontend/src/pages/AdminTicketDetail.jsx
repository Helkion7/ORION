import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicketById,
  updateTicket,
  addResponse,
  escalateTicket as escalateTicketService,
  returnToFirstLine as returnToFirstLineService,
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
  const [escalationNote, setEscalationNote] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [showEscalateForm, setShowEscalateForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [firstLineStaff, setFirstLineStaff] = useState([]);
  const [selectedFirstLineStaff, setSelectedFirstLineStaff] = useState("");

  const [ticketUpdate, setTicketUpdate] = useState({
    status: "",
    priority: "",
    assignedTo: "",
    devWorkRequired: false,
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
          devWorkRequired: data.ticket.devWorkRequired || false,
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
        devWorkRequired: result.data.devWorkRequired || false,
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
      const response = await getUsers({
        role: ["admin", "firstLineSupport", "secondLineSupport"],
      });
      if (response && response.data) {
        setUsers(response.data);

        // Filter for first line staff
        const firstLine = response.data.filter(
          (u) => u.role === "firstLineSupport"
        );
        setFirstLineStaff(firstLine);
      } else {
        console.error("Unexpected response format from getUsers");
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch support staff users:", err);
      setUsers([]);
    }
  };

  const handleUpdateTicket = async (e) => {
    e && e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      // Create a clean update object with only defined values
      const updateData = {};

      // Only include fields that have been changed
      if (ticketUpdate.status) updateData.status = ticketUpdate.status;
      if (ticketUpdate.priority) updateData.priority = ticketUpdate.priority;

      // Handle assignedTo specially - empty string should be explicitly included
      // to allow unassigning
      updateData.assignedTo = ticketUpdate.assignedTo;

      // Include dev work required flag if it's defined
      if (ticketUpdate.devWorkRequired !== undefined) {
        updateData.devWorkRequired = ticketUpdate.devWorkRequired;
      }

      await updateTicket(id, updateData);
      await fetchTicket();
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.errors?.[0]?.msg ||
          "Failed to update ticket"
      );
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

  const handleEscalate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await escalateTicketService(id, {
        escalationNote: escalationNote,
      });
      setShowEscalateForm(false);
      setEscalationNote("");
      await fetchTicket();
    } catch (err) {
      setError("Failed to escalate ticket");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnToFirstLine = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await returnToFirstLineService(id, {
        returnNote: returnNote,
        assignToId: selectedFirstLineStaff || undefined,
      });
      setShowReturnForm(false);
      setReturnNote("");
      setSelectedFirstLineStaff("");
      await fetchTicket();
    } catch (err) {
      setError("Failed to return ticket to first line");
      console.error(err);
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

  const renderWorkflowActions = () => {
    if (!ticket) return null;

    return (
      <div className="workflow-actions" style={{ marginTop: "15px" }}>
        <fieldset>
          <legend>Workflow Actions</legend>

          {/* First line support can escalate to second line */}
          {user.role === "firstLineSupport" &&
            ticket.supportLevel === "firstLine" && (
              <div>
                {!showEscalateForm ? (
                  <button
                    onClick={() => setShowEscalateForm(true)}
                    style={{ marginRight: "10px" }}
                  >
                    Escalate to Second Line
                  </button>
                ) : (
                  <form onSubmit={handleEscalate}>
                    <div
                      className="field-row-stacked"
                      style={{ width: "100%" }}
                    >
                      <label htmlFor="escalationNote">Escalation Note</label>
                      <textarea
                        id="escalationNote"
                        rows="3"
                        value={escalationNote}
                        onChange={(e) => setEscalationNote(e.target.value)}
                        required
                      />
                    </div>
                    <div className="button-row">
                      <button
                        type="button"
                        onClick={() => setShowEscalateForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !escalationNote.trim()}
                      >
                        Confirm Escalation
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          {/* Second line support can return to first line */}
          {user.role === "secondLineSupport" &&
            ticket.supportLevel === "secondLine" && (
              <div>
                {!showReturnForm ? (
                  <button
                    onClick={() => setShowReturnForm(true)}
                    style={{ marginRight: "10px" }}
                  >
                    Return to First Line
                  </button>
                ) : (
                  <form onSubmit={handleReturnToFirstLine}>
                    <div
                      className="field-row-stacked"
                      style={{ width: "100%" }}
                    >
                      <label htmlFor="returnNote">
                        Instructions for First Line
                      </label>
                      <textarea
                        id="returnNote"
                        rows="3"
                        value={returnNote}
                        onChange={(e) => setReturnNote(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field-row">
                      <label htmlFor="selectedAgent">
                        Assign to First Line Agent (Optional)
                      </label>
                      <select
                        id="selectedAgent"
                        value={selectedFirstLineStaff}
                        onChange={(e) =>
                          setSelectedFirstLineStaff(e.target.value)
                        }
                      >
                        <option value="">Unassigned</option>
                        {firstLineStaff.map((staff) => (
                          <option key={staff._id} value={staff._id}>
                            {staff.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="button-row">
                      <button
                        type="button"
                        onClick={() => setShowReturnForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !returnNote.trim()}
                      >
                        Return with Instructions
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          {/* For second line: Mark as needs development */}
          {user.role === "secondLineSupport" && (
            <div style={{ marginTop: "10px" }}>
              <div className="field-row">
                <input
                  id="dev-work-checkbox"
                  type="checkbox"
                  checked={ticketUpdate.devWorkRequired || false}
                  onChange={(e) =>
                    setTicketUpdate((prev) => ({
                      ...prev,
                      devWorkRequired: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="dev-work-checkbox">
                  Requires development work
                </label>
              </div>
              {ticketUpdate.devWorkRequired && (
                <button onClick={handleUpdateTicket} disabled={submitting}>
                  Update Development Status
                </button>
              )}
            </div>
          )}

          {/* Admin can do everything */}
          {user.role === "admin" && (
            <div>
              {ticket.supportLevel === "firstLine" && !showEscalateForm && (
                <button
                  onClick={() => setShowEscalateForm(true)}
                  style={{ marginRight: "10px" }}
                >
                  Escalate to Second Line
                </button>
              )}

              {ticket.supportLevel === "secondLine" && !showReturnForm && (
                <button
                  onClick={() => setShowReturnForm(true)}
                  style={{ marginRight: "10px" }}
                >
                  Return to First Line
                </button>
              )}

              <div style={{ marginTop: "10px" }}>
                <div className="field-row">
                  <input
                    id="dev-work-checkbox"
                    type="checkbox"
                    checked={ticketUpdate.devWorkRequired || false}
                    onChange={(e) =>
                      setTicketUpdate((prev) => ({
                        ...prev,
                        devWorkRequired: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="dev-work-checkbox">
                    Requires development work
                  </label>
                </div>
              </div>
            </div>
          )}
        </fieldset>
      </div>
    );
  };

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
                    <div>
                      <strong>Support Level:</strong>{" "}
                      {ticket.supportLevel === "firstLine"
                        ? "First Line"
                        : "Second Line"}
                    </div>
                    <div>
                      <strong>Dev Work Required:</strong>{" "}
                      {ticket.devWorkRequired ? "Yes" : "No"}
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
                          <option value="resolved">Resolved</option>
                          <option value="completed">Completed</option>
                          <option value="needs development">
                            Needs Development
                          </option>
                          <option value="reopened">Reopened</option>
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
                          Assign To (Support Staff)
                        </label>
                        <select
                          id="assignedTo"
                          name="assignedTo"
                          value={ticketUpdate.assignedTo}
                          onChange={handleInputChange}
                        >
                          <option value="">Unassigned</option>
                          {users.map((staff) => (
                            <option key={staff._id} value={staff._id}>
                              {staff.name} ({staff.role})
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

                {renderWorkflowActions()}

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
