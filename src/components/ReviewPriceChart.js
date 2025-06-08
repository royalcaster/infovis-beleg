import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { colors, hexToRgba } from "../colors";
import { formatPercentage } from "../utils";

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

const ReviewPriceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <section className="chart-section">
        <h2>H7: Price vs Review Analysis</h2>
        <p>No data available for this analysis.</p>
      </section>
    );
  }

  return (
    <section className="chart-section">
      <h1 className="chart-title">Price Impact on Game Reviews</h1>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="6 6" stroke={colors.background3} />
          <XAxis
            dataKey="price_bin"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
            tickFormatter={formatPercentage}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
            tickFormatter={formatNumber}
          />
          <Tooltip
            formatter={(value, name) => [
              name === "median_positive_percentage"
                ? formatPercentage(value)
                : formatNumber(value),
              name === "median_positive_percentage"
                ? "Median Positive %"
                : "Number of Games",
            ]}
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
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="median_positive_percentage"
            stroke={colors.blue}
            strokeWidth={3}
            dot={{ fill: colors.blue, stroke: colors.font2, strokeWidth: 2 }}
            activeDot={{
              r: 8,
              fill: colors.blue,
              stroke: colors.font2,
              strokeWidth: 2,
            }}
            name="Median Positive Review %"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="num_games"
            stroke={colors.magenta}
            strokeWidth={3}
            dot={{ fill: colors.magenta, stroke: colors.font2, strokeWidth: 2 }}
            activeDot={{
              r: 8,
              fill: colors.magenta,
              stroke: colors.font2,
              strokeWidth: 2,
            }}
            name="Number of Games"
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default ReviewPriceChart;
