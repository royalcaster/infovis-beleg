import React, { useMemo, useState } from "react";
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
  // Step C1: Validate data shape
  const isValid =
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].positive !== undefined &&
    data[0].estimated_owners_numeric !== undefined;

  // Step C2: Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("[ReviewsOwnersScatterChart] data sample:", data?.slice(0, 5));
  }

  // Always call hooks in the same order
  const safeData = isValid ? data : [];

  // Step D: Local filter state for reviews and owners
  const minReviews = useMemo(
    () => Math.min(...safeData.map((d) => d.positive)),
    [safeData]
  );
  const maxReviews = useMemo(
    () => Math.max(...safeData.map((d) => d.positive)),
    [safeData]
  );
  const minOwners = useMemo(
    () => Math.min(...safeData.map((d) => d.estimated_owners_numeric)),
    [safeData]
  );
  const maxOwners = useMemo(
    () => Math.max(...safeData.map((d) => d.estimated_owners_numeric)),
    [safeData]
  );
  const [reviewRange, setReviewRange] = useState([minReviews, maxReviews]);
  const [ownerRange, setOwnerRange] = useState([minOwners, maxOwners]);
  const resetFilters = () => {
    setReviewRange([minReviews, maxReviews]);
    setOwnerRange([minOwners, maxOwners]);
  };

  // Memoize the processed data to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    if (!safeData.length) return [];
    return safeData.map((item) => ({
      x: item.positive,
      y: item.estimated_owners_numeric,
      name: item.name || `Game (${item.positive} reviews)`,
    }));
  }, [safeData]);

  // Filter processed data by local filters
  const filteredData = useMemo(() => {
    return processedData.filter(
      (d) =>
        d.x >= reviewRange[0] &&
        d.x <= reviewRange[1] &&
        d.y >= ownerRange[0] &&
        d.y <= ownerRange[1]
    );
  }, [processedData, reviewRange, ownerRange]);

  // Step C3: Handle empty or malformed data
  if (!isValid) {
    return <div>No valid data available for Reviews vs Owners.</div>;
  }

  if (!data?.length) {
    return <div>No data available</div>;
  }

  return (
    <section className="chart-section">
      <h1 className="chart-title">
        Relationship Between Positive Reviews and Estimated Owners
      </h1>
      {/* Filter Controls */}
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
            Filters
          </span>
          <button
            onClick={resetFilters}
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
          <span style={{ minWidth: 32, color: colors.font2 }}>Reviews</span>
          <input
            type="range"
            min={minReviews}
            max={maxReviews}
            value={reviewRange[0]}
            onChange={(e) =>
              setReviewRange([Number(e.target.value), reviewRange[1]])
            }
            style={{ flex: 1 }}
          />
          <span style={{ color: colors.font2 }}>{reviewRange[0]}</span>
          <span style={{ color: colors.font2 }}>-</span>
          <span style={{ color: colors.font2 }}>{reviewRange[1]}</span>
          <input
            type="range"
            min={minReviews}
            max={maxReviews}
            value={reviewRange[1]}
            onChange={(e) =>
              setReviewRange([reviewRange[0], Number(e.target.value)])
            }
            style={{ flex: 1 }}
          />
          <span style={{ minWidth: 32, color: colors.font2 }}>
            {maxReviews}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ minWidth: 32, color: colors.font2 }}>Owners</span>
          <input
            type="range"
            min={minOwners}
            max={maxOwners}
            value={ownerRange[0]}
            onChange={(e) =>
              setOwnerRange([Number(e.target.value), ownerRange[1]])
            }
            style={{ flex: 1 }}
          />
          <span style={{ color: colors.font2 }}>
            {formatNumber(ownerRange[0])}
          </span>
          <span style={{ color: colors.font2 }}>-</span>
          <span style={{ color: colors.font2 }}>
            {formatNumber(ownerRange[1])}
          </span>
          <input
            type="range"
            min={minOwners}
            max={maxOwners}
            value={ownerRange[1]}
            onChange={(e) =>
              setOwnerRange([ownerRange[0], Number(e.target.value)])
            }
            style={{ flex: 1 }}
          />
          <span style={{ minWidth: 32, color: colors.font2 }}>
            {formatNumber(maxOwners)}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="6 6" stroke={colors.background3} />
          <XAxis
            type="number"
            dataKey="x"
            name="Positive Reviews"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
            tickFormatter={formatNumber}
            label={{ value: "Positive Reviews", position: "bottom" }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Estimated Owners"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
            tickFormatter={formatNumber}
            label={{ value: "Estimated Owners", angle: -90, position: "left" }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name) => {
              if (name === "y") {
                return [value.toLocaleString(), "Estimated Owners"];
              }
              return [value.toLocaleString(), "Positive Reviews"];
            }}
            labelFormatter={(label) => `Game: ${label}`}
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
          <Scatter
            name="Games"
            data={filteredData}
            fill={colors.accent7}
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </section>
  );
};

export default React.memo(ReviewsOwnersScatterChart);
