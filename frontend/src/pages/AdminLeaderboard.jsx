import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminLeaderboard } from "../services/ticketService";
import Loader from "../components/Loader";

const AdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const result = await getAdminLeaderboard();
        setLeaderboard(result.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load leaderboard data");
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Calculate total tickets resolved
  const totalTicketsResolved = leaderboard.reduce(
    (sum, admin) => sum + admin.ticketCount,
    0
  );

  // Get the top admin if available
  const topAdmin = leaderboard.length > 0 ? leaderboard[0] : null;

  return (
    <div className="window" style={{ width: "600px", margin: "0 auto" }}>
      <div className="title-bar">
        <div className="title-bar-text">
          Admin Leaderboard - Tickets Resolved
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body">
        <div className="field-row">
          <button onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <Loader message="Loading leaderboard data..." />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            {topAdmin && (
              <div className="window" style={{ marginBottom: "16px" }}>
                <div className="title-bar">
                  <div className="title-bar-text">Top Performer 🏆</div>
                </div>
                <div className="window-body" style={{ textAlign: "center" }}>
                  <h3>{topAdmin.adminName}</h3>
                  <p>
                    Tickets Resolved: <strong>{topAdmin.ticketCount}</strong>
                  </p>
                </div>
              </div>
            )}

            <div
              className="sunken-panel"
              style={{ height: "300px", overflow: "auto" }}
            >
              <table className="interactive">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Admin</th>
                    <th>Tickets Resolved</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={entry._id}
                      className={index === 0 ? "highlighted" : ""}
                    >
                      <td>{index + 1}</td>
                      <td>{entry.adminName}</td>
                      <td>{entry.ticketCount}</td>
                      <td>
                        <div
                          className="progress-indicator"
                          style={{ width: "100px" }}
                        >
                          <span
                            className="progress-indicator-bar"
                            style={{
                              width: `${
                                (entry.ticketCount /
                                  (topAdmin?.ticketCount || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>
                        No admins have resolved tickets yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <div className="status-bar">
        <p className="status-bar-field">Total admins: {leaderboard.length}</p>
        <p className="status-bar-field">
          Total tickets resolved: {totalTicketsResolved}
        </p>
      </div>
    </div>
  );
};

export default AdminLeaderboard;
