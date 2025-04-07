import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePasswordChange = () => {
    // Only validate if user is trying to change password
    if (
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword
    ) {
      if (!formData.currentPassword) {
        setError("Current password is required to change password");
        return false;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("New passwords do not match");
        return false;
      }

      if (formData.newPassword && formData.newPassword.length < 8) {
        setError("Password must be at least 8 characters long");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!validatePasswordChange()) {
      return;
    }

    // Prepare update data
    const updateData = {
      name: formData.name,
    };

    // Only include password fields if user is changing password
    if (formData.currentPassword && formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    try {
      setLoading(true);
      // This endpoint would need to be implemented in the backend
      await api.put("/auth/profile", updateData);
      setSuccess("Profile updated successfully");
      setIsEditing(false);

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      // If the user changed their password, log them out for security
      if (formData.newPassword) {
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="window"
      style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}
    >
      <div className="title-bar">
        <div className="title-bar-text">User Profile</div>
      </div>
      <div className="window-body">
        <div className="window" style={{ width: "100%", marginBottom: "20px" }}>
          <div className="title-bar">
            <div className="title-bar-text">Profile Information</div>
          </div>
          <div className="window-body">
            {!isEditing ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <strong>Name:</strong>
                  <span>{user?.name}</span>

                  <strong>Email:</strong>
                  <span>{user?.email}</span>

                  <strong>Role:</strong>
                  <span style={{ textTransform: "capitalize" }}>
                    {user?.role}
                  </span>

                  <strong>Member Since:</strong>
                  <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="button-row">
                  <button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="field-row-stacked" style={{ width: "100%" }}>
                  <label htmlFor="name">Name</label>
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
                    disabled
                  />
                  <small>Email cannot be changed</small>
                </div>

                <fieldset>
                  <legend>Change Password (Optional)</legend>

                  <div className="field-row-stacked" style={{ width: "100%" }}>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field-row-stacked" style={{ width: "100%" }}>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field-row-stacked" style={{ width: "100%" }}>
                    <label htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </fieldset>

                <div className="button-row">
                  <button type="button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="default">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="window" style={{ width: "100%" }}>
          <div className="title-bar">
            <div className="title-bar-text">Account Actions</div>
          </div>
          <div className="window-body">
            <p>
              <strong>Warning:</strong> The following actions can affect your
              account access.
            </p>
            <div className="button-row">
              <button onClick={() => logout().then(() => navigate("/login"))}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">User: {user?.name}</p>
        <p className="status-bar-field">Role: {user?.role}</p>
      </div>
    </div>
  );
};

export default Profile;
