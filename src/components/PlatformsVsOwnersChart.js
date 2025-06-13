import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PlatformsVsOwnersChart = ({ data }) => {
  // Step C1: Validate data shape
  const isValid =
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].num_platforms !== undefined &&
    data[0].avg_estimated_owners !== undefined;

  // Step C2: Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("[PlatformsVsOwnersChart] data sample:", data?.slice(0, 5));
  }

  // Step C3: Handle empty or malformed data
  if (!isValid) {
    return <div>No valid data available for Platforms vs Owners.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="platform" stroke="#fff" tick={{ fill: "#fff" }} />
        <YAxis
          stroke="#fff"
          tick={{ fill: "#fff" }}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
          }}
          formatter={(value) => [`${(value / 1000000).toFixed(1)}M`, "Owners"]}
        />
        <Legend
          wrapperStyle={{
            color: "#fff",
          }}
        />
        <Bar dataKey="owners" name="Owners" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PlatformsVsOwnersChart;
