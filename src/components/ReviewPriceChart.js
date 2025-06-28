import React, { useMemo } from "react";
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
  // Step C1: Validate data shape
  const isValid =
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].price_bin !== undefined &&
    data[0].median_positive_percentage !== undefined;

  // Step C2: Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("[ReviewPriceChart] data sample:", data?.slice(0, 5));
  }

  // Always call hooks in the same order
  const safeData = isValid ? data : [];

  // Memoize the processed data to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    if (!safeData.length) return [];
    return safeData
      .filter((item) => item.median_positive_percentage >= 0) // Filter out invalid percentages
      .map((item) => ({
        price: item.price_bin,
        median_positive: item.median_positive_percentage,
        num_games: item.num_games,
      }));
  }, [safeData]);

  // Step C3: Handle empty or malformed data
  if (!isValid) {
    return <div>No valid data available for Median Review vs Price.</div>;
  }

  if (!data?.length) {
    return <div>No data available</div>;
  }

  return (
    <section className="chart-section">
      <ChartHeading>Price Impact on Game Reviews</ChartHeading>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={processedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="price"
            label={{ value: "Price Range", position: "bottom" }}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            label={{
              value: "Median Positive Reviews (%)",
              angle: -90,
              position: "left",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: "Number of Games", angle: 90, position: "right" }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "median_positive") {
                return [`${value.toFixed(1)}%`, "Median Positive Reviews"];
              }
              return [value.toLocaleString(), "Number of Games"];
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="median_positive"
            name="Median Positive Reviews"
            stroke="#8884d8"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="num_games"
            name="Number of Games"
            stroke="#82ca9d"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default React.memo(ReviewPriceChart);
