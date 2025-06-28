import React, { useMemo, useState } from "react";
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

const ReviewPercentageOverTimeChart = ({ data }) => {
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

  // Reset filter to full range
  const resetFilter = () => setYearRange([minYear, maxYear]);

  // Filter data by year range
  const filteredData = useMemo(() => {
    return safeData.filter(
      (d) => d.release_year >= yearRange[0] && d.release_year <= yearRange[1]
    );
  }, [safeData, yearRange]);

  // Step C3: Handle empty or malformed data
  if (!isValid) {
    return <div>No valid data available for Review Percentage Over Time.</div>;
  }

  return (
    <div>
      <ChartHeading>Avg. Positive Review % Over Time</ChartHeading>
      <div
        style={{
          marginBottom: 20,
          padding: 12,
          background: colors.background2,
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 600, color: colors.accent7 }}>
            Year Range Filter
          </span>
          <button
            onClick={resetFilter}
            style={{
              background: colors.accent7,
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "2px 10px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Reset
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ minWidth: 32, color: colors.font2 }}>{minYear}</span>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={yearRange[0]}
            onChange={(e) =>
              setYearRange([Number(e.target.value), yearRange[1]])
            }
            style={{ flex: 1 }}
          />
          <span style={{ color: colors.font2 }}>{yearRange[0]}</span>
          <span style={{ color: colors.font2 }}>-</span>
          <span style={{ color: colors.font2 }}>{yearRange[1]}</span>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={yearRange[1]}
            onChange={(e) =>
              setYearRange([yearRange[0], Number(e.target.value)])
            }
            style={{ flex: 1 }}
          />
          <span style={{ minWidth: 32, color: colors.font2 }}>{maxYear}</span>
        </div>
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
