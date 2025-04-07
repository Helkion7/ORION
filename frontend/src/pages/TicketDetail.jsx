import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTicketById, addResponse } from "../services/ticketService";
import { useAuth } from "../contexts/AuthContext";

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const result = await getTicketById(id);
      setTicket(result.data);
    } catch (err) {
      setError("Failed to load ticket details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!response.trim()) return;

    try {
      setSubmitting(true);
      await addResponse(id, { text: response });
      setResponse("");
      await fetchTicket(); // Reload ticket with new response
    } catch (err) {
      setError("Failed to submit response");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "open":
        return { backgroundColor: "#ffcc00" };
      case "in progress":
        return { backgroundColor: "#66ccff" };
      case "solved":
        return { backgroundColor: "#66cc66" };
      default:
        return {};
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "low":
        return { color: "#008000" };
      case "medium":
        return { color: "#0000ff" };
      case "high":
        return { color: "#ff8c00" };
      case "urgent":
        return { color: "#ff0000" };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">Loading Ticket...</div>
        </div>
        <div className="window-body">
          <div className="loading-overlay">Loading ticket details...</div>
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
          <button onClick={() => navigate("/tickets")}>Back to Tickets</button>
        </div>
      </div>
    );
  }

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="title-bar">
        <div className="title-bar-text">Ticket #{ticket._id.slice(-5)}</div>
      </div>
      <div className="window-body">
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => navigate("/tickets")}>
            Back to All Tickets
          </button>
        </div>

        <div className="window" style={{ width: "100%" }}>
          <div className="title-bar">
            <div className="title-bar-text">Ticket Information</div>
          </div>
          <div className="window-body">
            <h3>{ticket.title}</h3>

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
                  className="status-badge"
                  style={getStatusStyle(ticket.status)}
                >
                  {ticket.status}
                </span>
              </div>
              <div>
                <strong>Priority:</strong>
                <span style={getPriorityStyle(ticket.priority)}>
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
            </div>

            <fieldset>
              <legend>Description</legend>
              <div style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</div>
            </fieldset>
          </div>
        </div>

        <div className="window" style={{ width: "100%", marginTop: "20px" }}>
          <div className="title-bar">
            <div className="title-bar-text">Responses</div>
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
                    borderLeft:
                      res.respondedBy._id === user.id
                        ? "4px solid #0000AA"
                        : "4px solid #AA0000",
                  }}
                >
                  <div className="title-bar">
                    <div className="title-bar-text">
                      {res.respondedBy.name} ({res.respondedBy.role}) -{" "}
                      {new Date(res.createdAt).toLocaleString()}
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
              <div className="button-row">
                <button type="submit" disabled={submitting || !response.trim()}>
                  {submitting ? "Submitting..." : "Submit Response"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">Status: {ticket.status}</p>
        <p className="status-bar-field">
          Last Updated: {new Date(ticket.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default TicketDetail;
