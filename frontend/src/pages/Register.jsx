import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        // Format validation errors
        const errorMessages = err.response.data.errors
          .map((e) => e.msg)
          .join(", ");
        setError(errorMessages);
      } else {
        setError(err.response?.data?.error || "Failed to register");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="window" style={{ width: "400px", margin: "50px auto" }}>
      <div className="title-bar">
        <div className="title-bar-text">Register for ORION Support System</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body">
        <form onSubmit={handleSubmit} className="form-container">
          {error && (
            <div
              className="error-message"
              style={{
                padding: "10px",
                backgroundColor: "#FFDDDD",
                marginBottom: "10px",
              }}
            >
              {error}
            </div>
          )}

          <div className="field-row-stacked" style={{ width: "100%" }}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-row-stacked" style={{ width: "100%" }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-row-stacked" style={{ width: "100%" }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <small>
              Password must be at least 8 characters and include uppercase,
              lowercase, number, and special character.
            </small>
          </div>

          <div className="button-row">
            <button type="submit" disabled={isLoading} className="default">
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">© 2023 ORION Support System</p>
        <p className="status-bar-field">v1.0.0</p>
      </div>
    </div>
  );
};

export default Register;
