import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, updateUser } from "../services/userService";
import LoadingIndicator from "../components/LoadingIndicator";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") {
        params.role = filter;
      }
      const response = await getUsers(params);
      setUsers(response.data);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingUserId(userId);
      await updateUser(userId, { role: newRole });
      // Update local state to reflect the change
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      setError(`Failed to update user role: ${err.message}`);
      console.error(err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    return (
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="title-bar">
        <div className="title-bar-text">User Management</div>
      </div>
      <div className="window-body">
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <div className="window" style={{ width: "100%", marginBottom: "15px" }}>
          <div className="title-bar">
            <div className="title-bar-text">Search and Filter</div>
          </div>
          <div className="window-body">
            <div
              style={{
                display: "flex",
                gap: "15px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div className="field-row" style={{ flex: "1" }}>
                <label htmlFor="search">Search:</label>
                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  style={{ flex: "1" }}
                />
              </div>
              <div className="field-row">
                <label htmlFor="role-filter">Filter by role:</label>
                <select
                  id="role-filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="firstLineSupport">First Line Support</option>
                  <option value="secondLineSupport">Second Line Support</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button onClick={fetchUsers}>Refresh</button>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingIndicator message="Loading users..." />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div
            className="sunken-panel"
            style={{ height: "calc(65vh - 200px)", minHeight: "300px" }}
          >
            <table className="interactive">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td style={{ width: "200px" }}>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          disabled={updatingUserId === user._id}
                        >
                          <option value="user">User</option>
                          <option value="firstLineSupport">
                            First Line Support
                          </option>
                          <option value="secondLineSupport">
                            Second Line Support
                          </option>
                          <option value="admin">Admin</option>
                        </select>
                        {updatingUserId === user._id && (
                          <span style={{ marginLeft: "5px" }}>
                            <div
                              className="progress-indicator"
                              style={{ width: "20px", display: "inline-block" }}
                            >
                              <span
                                className="progress-indicator-bar"
                                style={{ width: "80%" }}
                              />
                            </div>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="status-bar">
        <p className="status-bar-field">Total users: {filteredUsers.length}</p>
      </div>
    </div>
  );
};

export default UserManagement;
