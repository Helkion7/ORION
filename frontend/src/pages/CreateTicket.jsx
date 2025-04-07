import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../services/ticketService";

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "Hardware",
    "Software",
    "Network",
    "Security",
    "Account",
    "Other",
  ];
  const priorities = ["low", "medium", "high", "urgent"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category
    ) {
      setError("Please fill out all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const result = await createTicket(formData);
      navigate(`/tickets/${result.data._id}`);
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e) => e.msg).join(", "));
      } else {
        setError(err.response?.data?.error || "Failed to create ticket");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="title-bar">
        <div className="title-bar-text">Create New Support Ticket</div>
      </div>
      <div className="window-body">
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => navigate("/tickets")}>Back to Tickets</button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {error && <div className="error-message">{error}</div>}

          <div className="field-row-stacked" style={{ width: "100%" }}>
            <label htmlFor="title">Title*</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div className="field-row-stacked" style={{ width: "100%" }}>
            <label htmlFor="category">Category*</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row-stacked" style={{ width: "100%" }}>
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row-stacked" style={{ width: "100%" }}>
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              rows="8"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={2000}
            />
            <small>{formData.description.length}/2000 characters</small>
          </div>

          <div className="button-row">
            <button type="button" onClick={() => navigate("/tickets")}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="default">
              {submitting ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
