import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const TicketStatusChart = ({ data }) => {
  // Check if data is available and not empty
  if (!data || !data.length) {
    return <div className="chart-container">No status data available</div>;
  }

  // Define colors for each status
  const COLORS = {
    open: "#FF4500",
    "in progress": "#FFA500",
    solved: "#008000",
    "needs development": "#0000FF",
    reopened: "#800080",
    completed: "#006400",
    resolved: "#228B22",
  };

  // Make sure each item has a color
  const chartData = data.map((item) => ({
    ...item,
    color: COLORS[item.status] || "#999999",
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="status"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#c0c0c0",
              border: "2px solid #000",
              boxShadow:
                "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf",
            }}
            formatter={(value, name) => [`Count: ${value}`, `Status: ${name}`]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketStatusChart;
