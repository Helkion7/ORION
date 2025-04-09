import React from "react";

const TicketStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "#ffcc00"; // Yellow
      case "in progress":
        return "#66ccff"; // Light blue
      case "resolved":
        return "#66cc66"; // Green
      case "completed":
        return "#009900"; // Dark green
      case "needs development":
        return "#cc66ff"; // Purple
      case "reopened":
        return "#ff6666"; // Light red
      default:
        return "#cccccc"; // Gray
    }
  };

  return (
    <span
      className={`status-badge status-${status.replace(" ", "-")}`}
      style={{
        backgroundColor: getStatusColor(status),
        color: "#000",
        fontWeight: "bold",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "0.85em",
        display: "inline-block",
      }}
    >
      {status}
    </span>
  );
};

export default TicketStatusBadge;
