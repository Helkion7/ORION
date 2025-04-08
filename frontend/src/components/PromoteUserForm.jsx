import { useState } from "react";
import { promoteUser } from "../services/userService";

const PromoteUserForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await promoteUser(email);
      setSuccess(
        `User ${result.data.name} (${email}) has been promoted to admin successfully!`
      );
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to promote user");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="window" style={{ width: "100%", marginBottom: "20px" }}>
      <div className="title-bar">
        <div className="title-bar-text">Promote User to Admin</div>
      </div>
      <div className="window-body">
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="field-row-stacked" style={{ width: "100%" }}>
            <label htmlFor="email">User Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter email address of user to promote"
            />
          </div>

          <div className="button-row">
            <button type="submit" disabled={loading || !email.trim()}>
              {loading ? "Promoting..." : "Promote to Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoteUserForm;
