import React, { useMemo, useState, useEffect } from "react";
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

const ReviewsOwnersScatterChart = ({ data, align = "left" }) => {
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

  // Debounced state for filtering
  const [reviewRange, setReviewRange] = useState([minReviews, maxReviews]);
  const [ownerRange, setOwnerRange] = useState([minOwners, maxOwners]);

  // Live state for immediate slider feedback
  const [liveReviewRange, setLiveReviewRange] = useState([
    minReviews,
    maxReviews,
  ]);
  const [liveOwnerRange, setLiveOwnerRange] = useState([minOwners, maxOwners]);

  // Reset filters now also resets live values
  const resetFilters = () => {
    setReviewRange([minReviews, maxReviews]);
    setOwnerRange([minOwners, maxOwners]);
    setLiveReviewRange([minReviews, maxReviews]);
    setLiveOwnerRange([minOwners, maxOwners]);
  };

  // Effect to debounce review range changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setReviewRange(liveReviewRange);
    }, 200); // 200ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [liveReviewRange]);

  // Effect to debounce owner range changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setOwnerRange(liveOwnerRange);
    }, 200); // 200ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [liveOwnerRange]);

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
      <div className={`chart-heading-block ${align}`}>
        <ChartHeading align={align}>
          Relationship Between Positive Reviews and Estimated Owners
        </ChartHeading>
        <p
          style={{
            color: "#ccc",
            fontSize: "1.08rem",
            maxWidth: 700,
            margin: "0 0 24px 0",
          }}
        >
          This scatter plot shows the relationship between the number of
          positive reviews and the estimated number of owners for each game.
          Each point represents a game—games further to the right have more
          positive reviews, and those higher up have more owners. Use the
          filters to focus on specific ranges and spot trends or outliers.
        </p>
      </div>
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
            value={liveReviewRange[0]}
            onChange={(e) =>
              setLiveReviewRange([Number(e.target.value), liveReviewRange[1]])
            }
            style={{ flex: 1 }}
          />
          <span style={{ color: colors.font2 }}>{liveReviewRange[0]}</span>
          <span style={{ color: colors.font2 }}>-</span>
          <span style={{ color: colors.font2 }}>{liveReviewRange[1]}</span>
          <input
            type="range"
            min={minReviews}
            max={maxReviews}
            value={liveReviewRange[1]}
            onChange={(e) =>
              setLiveReviewRange([liveReviewRange[0], Number(e.target.value)])
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
            value={liveOwnerRange[0]}
            onChange={(e) =>
              setLiveOwnerRange([Number(e.target.value), liveOwnerRange[1]])
            }
            style={{ flex: 1 }}
          />
          <span style={{ color: colors.font2 }}>
            {formatNumber(liveOwnerRange[0])}
          </span>
          <span style={{ color: colors.font2 }}>-</span>
          <span style={{ color: colors.font2 }}>
            {formatNumber(liveOwnerRange[1])}
          </span>
          <input
            type="range"
            min={minOwners}
            max={maxOwners}
            value={liveOwnerRange[1]}
            onChange={(e) =>
              setLiveOwnerRange([liveOwnerRange[0], Number(e.target.value)])
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
