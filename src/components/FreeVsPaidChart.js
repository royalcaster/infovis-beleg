import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartHeading from "./ChartHeading";

const COLORS = ["#0088FE", "#00C49F"];

const FreeVsPaidChart = ({ data }) => {
  // Step C1: Validate data shape
  const isValid =
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].game_type !== undefined &&
    data[0].avg_estimated_owners !== undefined;

  // Step C2: Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("[FreeVsPaidChart] data sample:", data?.slice(0, 5));
  }

  // Step C3: Handle empty or malformed data
  if (!isValid) {
    return <div>No valid data available for Free vs Paid Games.</div>;
  }

  return (
    <div>
      <ChartHeading>Free vs Paid Games</ChartHeading>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="type"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
            }}
            formatter={(value) => [value, "Games"]}
          />
          <Legend
            wrapperStyle={{
              color: "#fff",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FreeVsPaidChart;
