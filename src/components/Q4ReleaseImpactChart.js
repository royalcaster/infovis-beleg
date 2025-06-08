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
import { colors, hexToRgba } from "../colors";

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

const Q4ReleaseImpactChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <section className="chart-section">
        <h2>H6: Q4 Release Impact Analysis</h2>
        <p>No data available for this analysis.</p>
      </section>
    );
  }

  return (
    <section className="chart-section">
      <h1 className="chart-title">Impact of Q4 Releases on Game Performance</h1>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="6 6" stroke={colors.background3} />
          <XAxis
            dataKey="release_period"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
            tickFormatter={formatNumber}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
            tickFormatter={formatNumber}
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
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              color: colors.font2,
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="avg_estimated_owners"
            fill={colors.blue}
            name="Average Estimated Owners"
          />
          <Bar
            yAxisId="right"
            dataKey="avg_num_reviews"
            fill={colors.magenta}
            name="Average Number of Reviews"
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

export default Q4ReleaseImpactChart;
