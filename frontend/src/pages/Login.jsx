import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="window" style={{ width: "400px", margin: "50px auto" }}>
      <div className="title-bar">
        <div className="title-bar-text">Login to ORION Support System</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body">
        <form onSubmit={handleSubmit} className="form-container">
          {error && <div className="error-message">{error}</div>}

          <div className="field-row-stacked" style={{ width: "100%" }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field-row-stacked" style={{ width: "100%" }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="button-row">
            <button type="submit" disabled={isLoading} className="default">
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            Don't have an account? <Link to="/register">Register</Link>
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

export default Login;
