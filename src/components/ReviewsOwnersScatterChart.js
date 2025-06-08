import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

const ReviewsOwnersScatterChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <section className="chart-section">
        <h2>H3: Relationship Between Reviews and Owners</h2>
        <p>No data available for this analysis.</p>
      </section>
    );
  }

  return (
    <section className="chart-section">
      <h1 className="chart-title">
        Relationship Between Positive Reviews and Estimated Owners
      </h1>
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="6 6" stroke={colors.background3} />
          <XAxis
            type="number"
            dataKey="positive"
            name="Positive Reviews"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
            tickFormatter={formatNumber}
          />
          <YAxis
            type="number"
            dataKey="estimated_owners_numeric"
            name="Estimated Owners"
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
          <Scatter data={data} fill={colors.blue} fillOpacity={0.6} />
        </ScatterChart>
      </ResponsiveContainer>
    </section>
  );
};

export default ReviewsOwnersScatterChart;
