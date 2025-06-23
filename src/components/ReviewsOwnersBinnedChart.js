import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { colors, hexToRgba } from "../colors";

const formatNumber = (num) => {
  if (num === null || num === undefined) return "N/A";
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1) + "M";
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1) + "K";
  }
  return num.toLocaleString();
};

const ReviewsOwnersBinnedChart = ({ data }) => {
  const chartData = data
    .map((item) => ({
      ...item,
      avg_estimated_owners: Math.round(item.avg_estimated_owners),
    }))
    .sort((a, b) => a.avg_estimated_owners - b.avg_estimated_owners);

  return (
    <section className="chart-section">
      <h1 className="chart-title">
        Average Estimated Owners by Positive Review Bins
      </h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 50, // Increased left margin for Y-axis label
            bottom: 30, // Increased bottom margin for X-axis label
          }}
          layout="vertical" // Switched to vertical layout
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.background3} />
          <XAxis
            type="number"
            stroke={colors.font2}
            tick={{ fill: colors.font2 }}
            tickFormatter={formatNumber}
          >
            <Label
              value="Average Estimated Owners"
              position="insideBottom"
              offset={-15}
              fill={colors.font2}
            />
          </XAxis>
          <YAxis
            type="category"
            dataKey="positive_reviews_bin"
            stroke={colors.font2}
            tick={{ fill: colors.font2 }}
            width={100} // Adjust width for labels
          >
            <Label
              value="Positive Review Bins"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle", fill: colors.font2 }}
            />
          </YAxis>
          <Tooltip
            contentStyle={{
              backgroundColor: hexToRgba(colors.background1, 0.8),
              borderColor: colors.background3,
              color: colors.font2,
              backdropFilter: "blur(5px)",
            }}
            formatter={(value, name) => [
              formatNumber(value),
              "Avg. Owners",
            ]}
            labelFormatter={(label) => `Reviews: ${label}`}
          />
          <Bar
            dataKey="avg_estimated_owners"
            fill={colors.accent7}
            radius={[0, 4, 4, 0]} // Rounded corners
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

export default ReviewsOwnersBinnedChart; 