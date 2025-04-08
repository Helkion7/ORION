import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import zxcvbn from "zxcvbn"; // Import zxcvbn

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // Track password strength

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check password strength when password field changes
    if (name === "password") {
      const result = zxcvbn(value);
      setPasswordStrength(result.score); // Score ranges from 0 (weakest) to 4 (strongest)
    }
  };

  const validateForm = () => {
    if (!formData.name) {
      setError("Name is required");
      return false;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Valid email is required");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    // Require minimum password strength (2 out of 4)
    if (passwordStrength < 2) {
      setError("Please choose a stronger password");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      console.log("Attempting to register with:", formData);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  // Get password strength description and color
  const getPasswordStrengthInfo = (score) => {
    switch (score) {
      case 0:
        return { text: "Very Weak", color: "#FF4136" };
      case 1:
        return { text: "Weak", color: "#FF851B" };
      case 2:
        return { text: "Fair", color: "#FFDC00" };
      case 3:
        return { text: "Good", color: "#2ECC40" };
      case 4:
        return { text: "Strong", color: "#01FF70" };
      default:
        return { text: "Very Weak", color: "#FF4136" };
    }
  };

  const passwordInfo = getPasswordStrengthInfo(passwordStrength);

  // Windows 98 style password meter
  const PasswordStrengthMeter = () => {
    if (!formData.password) return null;

    return (
      <div className="field-row-stacked" style={{ marginTop: "5px" }}>
        <div>
          <span>Password Strength: </span>
          <span style={{ color: passwordInfo.color, fontWeight: "bold" }}>
            {passwordInfo.text}
          </span>
        </div>
        <div
          className="sunken-panel"
          style={{ padding: "4px", marginTop: "5px" }}
        >
          <div
            style={{
              height: "10px",
              width: `${(passwordStrength + 1) * 20}%`,
              backgroundColor: passwordInfo.color,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="window"
      style={{ width: "400px", margin: "0 auto", marginTop: "50px" }}
    >
      <div className="title-bar">
        <div className="title-bar-text">Register</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => navigate("/")}></button>
        </div>
      </div>
      <div className="window-body">
        {error && (
          <div
            className="field-row"
            style={{ color: "red", marginBottom: "10px" }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="field-row-stacked">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="field-row-stacked">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="field-row-stacked">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <PasswordStrengthMeter />
            <small>
              Password must be at least 8 characters and include uppercase,
              lowercase, numbers, and special characters for best security.
            </small>
          </div>
          <div
            className="field-row"
            style={{ justifyContent: "flex-end", marginTop: "15px" }}
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || passwordStrength < 2}
              className="default"
            >
              Register
            </button>
          </div>
        </form>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">Press F1 for help</p>
        <p className="status-bar-field">Secure Registration</p>
      </div>
    </div>
  );
}

export default Register;
