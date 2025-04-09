import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const SupportStaffChart = ({ data }) => {
  // Check if data is available
  if (!data || !data.length) {
    return <div>No support staff data available</div>;
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#888" />
          <XAxis dataKey="name" stroke="#000" tick={{ fill: "#000" }} />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#0000AA"
            tick={{ fill: "#000" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#008000"
            tick={{ fill: "#000" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#c0c0c0",
              border: "2px solid #000",
              boxShadow:
                "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf",
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="ticketsAssigned"
            fill="#0000AA"
            name="Tickets Assigned"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="responseTime"
            stroke="#008000"
            name="Avg. Response Time (hours)"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SupportStaffChart;
