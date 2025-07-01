import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from "recharts";
import ChartHeading from "./ChartHeading";

const COLORS = ["#0088FE", "#00C49F"];

// Custom label renderer to position labels outside the pie and ensure visibility
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  // Position label 30px outside the outer radius for more space
  const radius = outerRadius + 30;
  let x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const isRight = x > cx;
  // Nudge x for better fit
  x = isRight ? x + 18 : x - 18;
  const percentText = `${(percent * 100).toFixed(0)}%`;
  return (
    <text
      x={x}
      y={y}
      fill="#b8f7d4"
      textAnchor={isRight ? "start" : "end"}
      dominantBaseline="central"
      fontSize={15}
      fontWeight={700}
      style={{ textShadow: "0 2px 8px #000a" }}
    >
      {name}
      <tspan x={x} dy={18}>
        {percentText}
      </tspan>
    </text>
  );
};

const FreeVsPaidChart = ({ data, align = "left" }) => {
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
    <div style={{ minWidth: 520, width: '100%' }}>
      <div className={`chart-heading-block ${align}`}>
        <ChartHeading align={align}>Free vs Paid Games</ChartHeading>
        <p
          style={{
            color: "#ccc",
            fontSize: "1.08rem",
            maxWidth: 700,
            margin: "0 0 24px 0",
          }}
        >
          This chart compares the number of free-to-play games versus paid games
          on Steam. Each slice of the pie represents the proportion of games in
          each category, helping you quickly see how common free games are
          compared to paid ones.
        </p>
      </div>
      <div style={{ padding: '0 60px' }}>
        <ResponsiveContainer width="100%" minWidth={400} height={400}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label={renderCustomLabel}
              labelLine={false}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
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
    </div>
  );
};

export default FreeVsPaidChart;
