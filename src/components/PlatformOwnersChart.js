import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { colors, hexToRgba } from "../colors";
import ChartHeading from "./ChartHeading";

const formatNumber = (num) => {
  if (num === null || num === undefined || num === "N/A") return "N/A";
  const numericValue = parseFloat(num);
  if (isNaN(numericValue)) return "N/A";

  if (Math.abs(numericValue) >= 1000000)
    return (numericValue / 1000000).toFixed(1) + "M";
  if (Math.abs(numericValue) >= 1000)
    return (numericValue / 1000).toFixed(1) + "K";

  return numericValue.toLocaleString();
};

const PlatformOwnersChart = ({ data, align = "left" }) => {
  if (!data || data.length === 0) {
    return (
      <section className="chart-section">
        <h2>Platform Owners Analysis</h2>
        <p>No data available for this analysis.</p>
      </section>
    );
  }

  return (
    <section className="chart-section">
      <div className={`chart-heading-block ${align}`}>
        <ChartHeading align={align}>
          Average Estimated Owners by Platform Count
        </ChartHeading>
        <p
          style={{
            color: "#ccc",
            fontSize: "1.08rem",
            maxWidth: 700,
            margin: "0 0 24px 0",
          }}
        >
          This chart shows how the average number of owners changes depending on
          how many platforms a game is available on. Each bar represents games
          with a specific number of platform releases, helping you see if
          multi-platform games tend to reach more players.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="6 6" stroke={colors.background3} />
          <XAxis
            dataKey="num_platforms"
            name="Number of Platforms"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14, dy: 10 }}
          />
          <YAxis
            tickFormatter={formatNumber}
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14, dx: -10 }}
          />
          <Tooltip
            formatter={(value, name) => [formatNumber(value), name]}
            contentStyle={{
              backgroundColor: hexToRgba(colors.background1, 0.5),
              borderColor: "rgba(60, 60, 60, 0)",
              borderRadius: "5px",
              color: colors.font2,
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
            }}
            labelStyle={{
              color: colors.font2,
              fontWeight: "bold",
              margin: "5px",
            }}
            itemStyle={{ color: colors.font2 }}
            cursor={false}
          />
          <Bar
            dataKey="avg_estimated_owners"
            fill={colors.blue}
            name="Average Estimated Owners"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

export default PlatformOwnersChart;
