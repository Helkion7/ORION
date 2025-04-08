import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTicketStats, getTickets } from "../services/ticketService";
import { getUsers } from "../services/userService";
import { useSocket } from "../contexts/SocketContext";
import LoadingIndicator from "../components/LoadingIndicator";
import PromoteUserForm from "../components/PromoteUserForm";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [users, setUsers] = useState([]);
  const [ticketStats, setTicketStats] = useState({
    byStatus: { labels: [], data: [] },
    byPriority: { labels: [], data: [] },
    byDay: { labels: [], data: [] },
  });

  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch statistics
        const statsResult = await getTicketStats();
        setStats(statsResult.data);

        // Fetch recent tickets with sorting
        const ticketsResult = await getTickets({
          limit: 10,
          sort: `${sortDirection === "desc" ? "-" : ""}${sortField}`,
        });
        setRecentTickets(ticketsResult.data);

        // Process data for charts
        processTicketStats(ticketsResult.data);

        // Fetch users
        const usersResult = await getUsers();
        setUsers(usersResult.data);
      } catch (err) {
        setError("Failed to fetch dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sortField, sortDirection]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new tickets
    const handleNewTicket = (data) => {
      setRecentTickets((prevTickets) => {
        // Check if the ticket already exists
        const exists = prevTickets.some((t) => t._id === data.ticket._id);
        if (!exists) {
          // Add new ticket at the beginning and maintain the limit
          return [data.ticket, ...prevTickets.slice(0, 9)];
        }
        return prevTickets;
      });

      // Update stats counts
      setStats((prevStats) => {
        if (!prevStats) return prevStats;

        // Deep clone the stats object to avoid direct mutation
        const newStats = JSON.parse(JSON.stringify(prevStats));

        // Update status stats count
        const statusIndex = newStats.statusStats.findIndex(
          (s) => s._id === data.ticket.status
        );
        if (statusIndex >= 0) {
          newStats.statusStats[statusIndex].count += 1;
        }

        // Update category stats count
        const categoryIndex = newStats.categoryStats.findIndex(
          (c) => c._id === data.ticket.category
        );
        if (categoryIndex >= 0) {
          newStats.categoryStats[categoryIndex].count += 1;
        }

        // Update priority stats count
        const priorityIndex = newStats.priorityStats.findIndex(
          (p) => p._id === data.ticket.priority
        );
        if (priorityIndex >= 0) {
          newStats.priorityStats[priorityIndex].count += 1;
        }

        return newStats;
      });
    };

    // Listen for ticket updates
    const handleUpdateTicket = (data) => {
      setRecentTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === data.ticket._id ? data.ticket : ticket
        )
      );
    };

    socket.on("newTicket", handleNewTicket);
    socket.on("updateTicket", handleUpdateTicket);
    socket.on("ticketResponse", handleUpdateTicket);

    return () => {
      socket.off("newTicket", handleNewTicket);
      socket.off("updateTicket", handleUpdateTicket);
      socket.off("ticketResponse", handleUpdateTicket);
    };
  }, [socket]);

  const processTicketStats = (tickets) => {
    // Process by status
    const statusCounts = {};
    tickets.forEach((ticket) => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
    });

    // Process by priority
    const priorityCounts = {};
    tickets.forEach((ticket) => {
      priorityCounts[ticket.priority] =
        (priorityCounts[ticket.priority] || 0) + 1;
    });

    // Process by day (last 7 days)
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      })
      .reverse();

    const ticketsByDay = {};
    last7Days.forEach((day) => (ticketsByDay[day] = 0));

    tickets.forEach((ticket) => {
      const createdDate = new Date(ticket.createdAt)
        .toISOString()
        .split("T")[0];
      if (ticketsByDay[createdDate] !== undefined) {
        ticketsByDay[createdDate]++;
      }
    });

    setTicketStats({
      byStatus: {
        labels: Object.keys(statusCounts),
        data: Object.values(statusCounts),
      },
      byPriority: {
        labels: Object.keys(priorityCounts),
        data: Object.values(priorityCounts),
      },
      byDay: {
        labels: Object.keys(ticketsByDay),
        data: Object.values(ticketsByDay),
      },
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "Pixelated MS Sans Serif",
            size: 12,
          },
          color: "#000000",
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: "Pixelated MS Sans Serif",
            size: 12,
          },
          color: "#000000",
        },
      },
      y: {
        ticks: {
          font: {
            family: "Pixelated MS Sans Serif",
            size: 12,
          },
          color: "#000000",
        },
      },
    },
  };

  const win98Colors = [
    "#000080",
    "#008080",
    "#808000",
    "#800080",
    "#ff0000",
    "#008000",
    "#0000ff",
  ];

  const statusChartData = {
    labels: ticketStats.byStatus.labels,
    datasets: [
      {
        label: "Tickets by Status",
        data: ticketStats.byStatus.data,
        backgroundColor: win98Colors,
        borderWidth: 1,
      },
    ],
  };

  const priorityChartData = {
    labels: ticketStats.byPriority.labels,
    datasets: [
      {
        label: "Tickets by Priority",
        data: ticketStats.byPriority.data,
        backgroundColor: win98Colors,
        borderWidth: 1,
      },
    ],
  };

  const dailyChartData = {
    labels: ticketStats.byDay.labels,
    datasets: [
      {
        label: "Tickets Created",
        data: ticketStats.byDay.data,
        backgroundColor: "#000080",
        borderColor: "#000080",
        tension: 0.1,
      },
    ],
  };

  const renderCharts = () => {
    return (
      <div className="charts-container">
        <div className="window" style={{ width: "100%", marginBottom: "16px" }}>
          <div className="title-bar">
            <div className="title-bar-text">Ticket Statistics</div>
          </div>
          <div className="window-body">
            <div
              className="field-row"
              style={{ justifyContent: "space-between" }}
            >
              <div
                className="chart-window"
                style={{ width: "48%", height: "300px" }}
              >
                <div className="window" style={{ height: "100%" }}>
                  <div className="title-bar">
                    <div className="title-bar-text">Tickets By Status</div>
                  </div>
                  <div
                    className="window-body"
                    style={{ height: "calc(100% - 20px)" }}
                  >
                    <div style={{ height: "100%", padding: "8px" }}>
                      <Pie data={statusChartData} options={chartOptions} />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="chart-window"
                style={{ width: "48%", height: "300px" }}
              >
                <div className="window" style={{ height: "100%" }}>
                  <div className="title-bar">
                    <div className="title-bar-text">Tickets By Priority</div>
                  </div>
                  <div
                    className="window-body"
                    style={{ height: "calc(100% - 20px)" }}
                  >
                    <div style={{ height: "100%", padding: "8px" }}>
                      <Pie data={priorityChartData} options={chartOptions} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="chart-window"
              style={{
                width: "100%",
                height: "300px",
                marginTop: "16px",
              }}
            >
              <div className="window" style={{ height: "100%" }}>
                <div className="title-bar">
                  <div className="title-bar-text">
                    Tickets Created (Last 7 Days)
                  </div>
                </div>
                <div
                  className="window-body"
                  style={{ height: "calc(100% - 20px)" }}
                >
                  <div style={{ height: "100%", padding: "8px" }}>
                    <Line data={dailyChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatStatusStats = (statusStats) => {
    if (!statusStats) return [];

    const statuses = ["open", "in progress", "solved"];
    return statuses.map((status) => {
      const found = statusStats.find((s) => s._id === status);
      return {
        status,
        count: found ? found.count : 0,
      };
    });
  };

  const formatCategoryStats = (categoryStats) => {
    if (!categoryStats) return [];
    return categoryStats || [];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "#ffcc00";
      case "in progress":
        return "#66ccff";
      case "solved":
        return "#66cc66";
      default:
        return "#e0e0e0";
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortClass = (field) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? "sort-asc" : "sort-desc";
  };

  if (loading) {
    return (
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">Admin Dashboard</div>
        </div>
        <div className="window-body">
          <LoadingIndicator
            message="Loading dashboard data..."
            showSpinner={true}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">Admin Dashboard</div>
        </div>
        <div className="window-body">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="title-bar">
        <div className="title-bar-text">Admin Dashboard</div>
      </div>
      <div className="window-body">
        <h2>Admin Control Panel</h2>

        <PromoteUserForm />

        {renderCharts()}

        <div className="dashboard-grid">
          <div className="window" style={{ width: "100%" }}>
            <div className="title-bar">
              <div className="title-bar-text">Quick Actions</div>
            </div>
            <div className="window-body">
              <div className="desktop-icon-grid">
                <Link to="/admin/tickets" className="desktop-icon">
                  <img
                    src="https://i.imgur.com/cxTwSkA.png"
                    alt="All Tickets"
                  />
                  <span>All Tickets</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="window" style={{ width: "100%" }}>
            <div className="title-bar">
              <div className="title-bar-text">Ticket Status</div>
            </div>
            <div className="window-body">
              <div className="stats-container">
                {stats &&
                  formatStatusStats(stats.statusStats).map((item) => (
                    <div
                      key={item.status}
                      className="window"
                      style={{ margin: "5px" }}
                    >
                      <div
                        className="title-bar"
                        style={{ backgroundColor: getStatusColor(item.status) }}
                      >
                        <div className="title-bar-text">{item.status}</div>
                      </div>
                      <div
                        className="window-body"
                        style={{ textAlign: "center", padding: "10px" }}
                      >
                        <h2 style={{ margin: "0" }}>{item.count}</h2>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="window" style={{ width: "100%", marginTop: "20px" }}>
          <div className="title-bar">
            <div className="title-bar-text">Recent Tickets</div>
          </div>
          <div className="window-body">
            {recentTickets.length === 0 ? (
              <p>No tickets found in the system.</p>
            ) : (
              <div
                className="sunken-panel"
                style={{
                  height: "calc(40vh - 100px)",
                  minHeight: "250px",
                }}
              >
                <table className="interactive">
                  <thead>
                    <tr>
                      <th
                        onClick={() => handleSort("_id")}
                        className={getSortClass("_id")}
                      >
                        ID
                      </th>
                      <th
                        onClick={() => handleSort("user.name")}
                        className={getSortClass("user.name")}
                      >
                        User
                      </th>
                      <th
                        onClick={() => handleSort("title")}
                        className={getSortClass("title")}
                      >
                        Title
                      </th>
                      <th
                        onClick={() => handleSort("category")}
                        className={getSortClass("category")}
                      >
                        Category
                      </th>
                      <th
                        onClick={() => handleSort("status")}
                        className={getSortClass("status")}
                      >
                        Status
                      </th>
                      <th
                        onClick={() => handleSort("priority")}
                        className={getSortClass("priority")}
                      >
                        Priority
                      </th>
                      <th
                        onClick={() => handleSort("createdAt")}
                        className={getSortClass("createdAt")}
                      >
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map((ticket) => (
                      <tr
                        key={ticket._id}
                        onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                      >
                        <td>{ticket._id.slice(-5)}</td>
                        <td>{ticket.user?.name || "Unknown"}</td>
                        <td>{ticket.title}</td>
                        <td>{ticket.category}</td>
                        <td>
                          <span
                            className={`status-badge status-${ticket.status.replace(
                              " ",
                              "-"
                            )}`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className={`priority-${ticket.priority}`}>
                          {ticket.priority}
                        </td>
                        <td>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ marginTop: "10px", textAlign: "right" }}>
              <Link to="/admin/tickets">
                <button>View all tickets</button>
              </Link>
            </div>
          </div>
        </div>

        <div className="window" style={{ width: "100%", marginTop: "20px" }}>
          <div className="title-bar">
            <div className="title-bar-text">Ticket Categories</div>
          </div>
          <div className="window-body">
            <div className="sunken-panel">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {stats &&
                    formatCategoryStats(stats.categoryStats).map((item) => (
                      <tr key={item._id}>
                        <td>{item._id}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">Admin Dashboard</p>
        <p className="status-bar-field">
          Total Tickets:{" "}
          {stats?.statusStats?.reduce((acc, curr) => acc + curr.count, 0) || 0}
        </p>
        <p className="status-bar-field">Users: {users.length}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
