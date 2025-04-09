import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

const TicketPriorityChart = ({ data }) => {
  // Check if data is available and not empty
  if (!data || !data.length) {
    return <div className="chart-container">No priority data available</div>;
  }

  // Define colors for each priority
  const COLORS = {
    low: "#008000",
    medium: "#FFA500",
    high: "#FF0000",
    urgent: "#8B0000",
  };

  // Format data for the chart
  const chartData = data.map((item) => ({
    name: item.status || item._id,
    count: item.count,
    fill: COLORS[item.status || item._id] || "#999999",
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#888" />
          <XAxis dataKey="name" stroke="#000" tick={{ fill: "#000" }} />
          <YAxis stroke="#000" tick={{ fill: "#000" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#c0c0c0",
              border: "2px solid #000",
              boxShadow:
                "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf",
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketPriorityChart;
