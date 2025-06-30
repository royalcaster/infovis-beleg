import React, { useMemo, useState, useEffect } from "react";
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
import ChartHeading from "./ChartHeading";

const formatYAxisTick = (tickValue) => {
  if (tickValue === 0) {
    return "";
  }
  return formatPercentage(tickValue);
};

// Add this helper for a two-handle slider
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

const ReviewPercentageOverTimeChart = ({ data, align = "left" }) => {
  // Step C1: Validate data shape
  const isValid =
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].release_year !== undefined &&
    data[0].avg_positive_percentage !== undefined;

  // Step C2: Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log(
      "[ReviewPercentageOverTimeChart] data sample:",
      data?.slice(0, 5)
    );
  }

  // Always call hooks in the same order
  const safeData = isValid ? data : [];

  // Step D: Year range filter state
  const years = useMemo(() => safeData.map((d) => d.release_year), [safeData]);
  const minYear = useMemo(() => Math.min(...years), [years]);
  const maxYear = useMemo(() => Math.max(...years), [years]);
  const [yearRange, setYearRange] = useState([minYear, maxYear]);
  const [activeHandle, setActiveHandle] = useState(null); // 'start' or 'end' or null

  // Always reset to full range if minYear or maxYear changes
  useEffect(() => {
    setYearRange([minYear, maxYear]);
  }, [minYear, maxYear]);

  // Reset filter to full range
  const resetFilter = () => setYearRange([minYear, maxYear]);

  // Filter data by year range
  const filteredData = safeData;

  // Step C3: Handle empty or malformed data
  if (!isValid) {
    return <div>No valid data available for Review Percentage Over Time.</div>;
  }

  return (
    <div>
      <div className={`chart-heading-block ${align}`}>
        <ChartHeading align={align}>Positive reviews over time</ChartHeading>
        <p
          style={{
            color: "#ccc",
            fontSize: "1.08rem",
            maxWidth: 700,
            margin: "0 0 24px 0",
          }}
        >
          This chart shows how the average percentage of positive reviews for
          games on Steam has changed over time. Each point represents the
          average review score for games released in a given year, helping you
          spot trends in player satisfaction across different periods.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={filteredData}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="6 6" stroke={colors.background3} />
          <XAxis
            dataKey="release_year"
            name="Release Year"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14, dy: 10 }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={formatYAxisTick}
            allowDecimals={false}
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14, dx: -10 }}
          />
          <Tooltip
            formatter={(value) => formatPercentage(value)}
            contentStyle={{
              backgroundColor: hexToRgba(colors.accent7, 0.1),
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
            verticalAlign="top"
            wrapperStyle={{ paddingBottom: "20px" }}
            formatter={(value, entry, index) => (
              <span style={{ color: colors.accent7 }}>{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="avg_positive_percentage"
            stroke={colors.accent7}
            strokeWidth={2}
            dot={false}
            name="Avg. Positive Review %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReviewPercentageOverTimeChart;
