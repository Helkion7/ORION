import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const TicketTimelineChart = ({ data }) => {
  // Check if data is available
  if (!data || !data.length) {
    return <div>No timeline data available</div>;
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#888" />
          <XAxis dataKey="date" stroke="#000" tick={{ fill: "#000" }} />
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
          <Line
            type="monotone"
            dataKey="count"
            stroke="#0000AA"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketTimelineChart;
