import { useState, useEffect } from "react";
import { getTicketStats } from "../services/ticketService";

const AdminStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const result = await getTicketStats();
        setStats(result.data);
      } catch (err) {
        setError("Failed to load statistics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading statistics...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!stats) return <p>No statistics available</p>;

  // Format role stats from the API response
  const roleStats = stats.roleStats || [];
  const statusStats = stats.statusStats || [];
  const categoryStats = stats.categoryStats || [];

  // Calculate total tickets
  const totalTickets = statusStats.reduce((acc, stat) => acc + stat.count, 0);

  // Count resolved tickets (solved status)
  const resolvedTickets =
    statusStats.find((s) => s._id === "solved")?.count || 0;

  // Count completed tickets (we'll consider tickets that are solved as completed)
  const completedTickets = resolvedTickets;

  return (
    <div className="window" style={{ width: "100%", marginBottom: "20px" }}>
      <div className="title-bar">
        <div className="title-bar-text">Support Staff Statistics</div>
      </div>
      <div className="window-body">
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {/* Role assignment stats */}
          <div style={{ flex: "1 1 300px" }}>
            <fieldset>
              <legend>Tickets by Support Role</legend>
              <div className="sunken-panel" style={{ height: "200px" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Assigned Tickets</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Unassigned</td>
                      <td>
                        {roleStats.find((r) => r._id === null)?.count || 0}
                      </td>
                      <td>
                        {totalTickets
                          ? Math.round(
                              ((roleStats.find((r) => r._id === null)?.count ||
                                0) /
                                totalTickets) *
                                100
                            )
                          : 0}
                        %
                      </td>
                    </tr>
                    <tr>
                      <td>First Line Support</td>
                      <td>
                        {roleStats.find((r) => r._id === "firstLineSupport")
                          ?.count || 0}
                      </td>
                      <td>
                        {totalTickets
                          ? Math.round(
                              ((roleStats.find(
                                (r) => r._id === "firstLineSupport"
                              )?.count || 0) /
                                totalTickets) *
                                100
                            )
                          : 0}
                        %
                      </td>
                    </tr>
                    <tr>
                      <td>Second Line Support</td>
                      <td>
                        {roleStats.find((r) => r._id === "secondLineSupport")
                          ?.count || 0}
                      </td>
                      <td>
                        {totalTickets
                          ? Math.round(
                              ((roleStats.find(
                                (r) => r._id === "secondLineSupport"
                              )?.count || 0) /
                                totalTickets) *
                                100
                            )
                          : 0}
                        %
                      </td>
                    </tr>
                    <tr>
                      <td>Admin</td>
                      <td>
                        {roleStats.find((r) => r._id === "admin")?.count || 0}
                      </td>
                      <td>
                        {totalTickets
                          ? Math.round(
                              ((roleStats.find((r) => r._id === "admin")
                                ?.count || 0) /
                                totalTickets) *
                                100
                            )
                          : 0}
                        %
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </fieldset>
          </div>

          {/* Status stats */}
          <div style={{ flex: "1 1 300px" }}>
            <fieldset>
              <legend>Ticket Status Summary</legend>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <div className="field-row">
                  <label>Total Tickets:</label>
                  <strong>{totalTickets}</strong>
                </div>
                <div className="field-row">
                  <label>Resolved Tickets:</label>
                  <strong>{resolvedTickets}</strong>
                </div>
                <div className="field-row">
                  <label>Completion Rate:</label>
                  <strong>
                    {totalTickets
                      ? Math.round((resolvedTickets / totalTickets) * 100)
                      : 0}
                    %
                  </strong>
                </div>
                <div className="field-row">
                  <label>Open Tickets:</label>
                  <strong>
                    {statusStats.find((s) => s._id === "open")?.count || 0}
                  </strong>
                </div>
                <div className="field-row">
                  <label>In Progress:</label>
                  <strong>
                    {statusStats.find((s) => s._id === "in progress")?.count ||
                      0}
                  </strong>
                </div>
              </div>
            </fieldset>
          </div>
        </div>

        {/* Status Progress Bar */}
        <fieldset style={{ marginTop: "15px" }}>
          <legend>Ticket Resolution Progress</legend>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: "1" }}>
              <div className="progress-indicator">
                <span
                  className="progress-indicator-bar"
                  style={{
                    width: `${
                      totalTickets
                        ? Math.round((resolvedTickets / totalTickets) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              {totalTickets
                ? Math.round((resolvedTickets / totalTickets) * 100)
                : 0}
              %
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default AdminStatistics;
