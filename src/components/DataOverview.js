import React, { useState } from "react";
import ChartHeading from "./ChartHeading";
import { colors } from "../colors";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const formatNumber = (num) => {
  if (num === null || num === undefined || num === "N/A") return "N/A";
  const numericValue = parseFloat(num);
  if (isNaN(numericValue)) return "N/A";
  if (Math.abs(numericValue) >= 1e6)
    return (numericValue / 1e6).toFixed(1) + "M";
  if (Math.abs(numericValue) >= 1e3)
    return (numericValue / 1e3).toFixed(1) + "K";
  return numericValue.toLocaleString();
};

const metricTooltips = {
  Metric: "The name of the data column/metric.",
  Min: "Minimum value in the dataset.",
  Max: "Maximum value in the dataset.",
  Mean: "Average value (sum divided by count).",
  Median: "Middle value when sorted.",
  "Std. Dev.":
    "Standard deviation: how much the values typically differ from the mean (spread of the data).",
};

const pieColors = [colors.accent3, colors.accent1];

function getRelativePosition(value, min, max) {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

const DataOverview = ({ info }) => {
  const [sortColumn, setSortColumn] = useState("Metric");
  const [sortDirection, setSortDirection] = useState("asc");
  const [hoveredCol, setHoveredCol] = useState(null);
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);

  if (!info) return null;
  const { total_games_analyzed, numeric_column_stats, free_vs_paid_counts } =
    info;

  // Pie chart data
  const pieData = free_vs_paid_counts
    ? free_vs_paid_counts.map((item) => ({
        name: item.type === "Free" ? "Free Games" : "Paid Games",
        value: item.count,
        color: item.type === "Free" ? colors.accent3 : colors.accent1,
      }))
    : [];

  // Sorting logic
  const getSortValue = (stat, col) => {
    switch (col) {
      case "Metric":
        return stat.column_name;
      case "Min":
        return stat.min;
      case "Max":
        return stat.max;
      case "Mean":
        return stat.average;
      case "Median":
        return stat.median;
      case "Std. Dev.":
        return stat.std_dev;
      default:
        return stat.column_name;
    }
  };
  const sortedStats = [...numeric_column_stats].sort((a, b) => {
    const aVal = getSortValue(a, sortColumn);
    const bVal = getSortValue(b, sortColumn);
    if (aVal === undefined || bVal === undefined) return 0;
    if (typeof aVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
  });

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  // Table columns
  const columns = ["Metric", "Min", "Max", "Mean", "Median", "Std. Dev."];

  return (
    <section
      style={{
        maxWidth: 1400,
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        fontFamily: "Roboto, Arial, Helvetica, sans-serif",
        marginBottom: -200,
      }}
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        {/* Left-aligned heading and paragraph */}
        <div style={{ flex: 1, textAlign: "left" }}>
          <ChartHeading>Overview & Statistics</ChartHeading>
          <p
            style={{
              color: colors.font2,
              fontSize: "1.13rem",
              marginBottom: 32,
              maxWidth: 900,
              fontFamily: "Roboto",
              fontWeight: 300,
              textAlign: "left",
            }}
          >
            This section summarizes the main statistics of the Steam games
            dataset used in this project. It provides an overview of the data's
            size, key metrics, and distributions, helping you understand the
            scope and characteristics of the analyzed games.
          </p>
        </div>
        {/* Right-aligned heading and paragraph (for demonstration, duplicate with right alignment) */}

        {/* Pie chart for Free vs Paid Games */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 40,
            flex: 1,
          }}
        >
          <ResponsiveContainer width={500} height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                label={({ name, value }) => `${name}: ${formatNumber(value)}`}
                labelLine={false}
                isAnimationActive={false}
                stroke="none"
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [formatNumber(value), name]}
                contentStyle={{
                  backgroundColor: "#23263a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontFamily: "Roboto",
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{
                  color: colors.font2,
                  fontSize: 16,
                  fontFamily: "Roboto",
                  marginTop: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ height: 50 }}></div>
      <button
        onClick={() => setIsTableCollapsed(!isTableCollapsed)}
        style={{
          background: colors.background3,
          color: colors.font1,
          border: "none",
          padding: "10px 20px",
          borderRadius: 5,
          cursor: "pointer",
          marginBottom: 20,
          fontSize: 16,
          fontWeight: 700,
          transition: "background 0.15s",
        }}
      >
        {isTableCollapsed ? "Show Statistics Table" : "Hide Statistics Table"}
      </button>
      {!isTableCollapsed && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "none",
            fontFamily: "Roboto, Arial, Helvetica, sans-serif",
          }}
        >
          <thead>
            <tr
              style={{
                color: colors.font1,
                fontSize: 16,
                fontWeight: 700,
                background: colors.background3,
                height: 55,
              }}
            >
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "10px 16px",
                    textAlign: col === "Metric" ? "left" : "right",
                    cursor: "pointer",
                    position: "relative",
                    background:
                      hoveredCol === col
                        ? colors.background1
                        : colors.background3,
                    transition: "background 0.15s",
                    userSelect: "none",
                    fontFamily: "Roboto, Arial, Helvetica, sans-serif",
                  }}
                  onClick={() => handleSort(col)}
                  onMouseEnter={() => setHoveredCol(col)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <span style={{ borderBottom: "1px dotted #aaa" }}>{col}</span>
                  <span
                    style={{
                      fontSize: 13,
                      marginLeft: 6,
                      opacity: sortColumn === col ? 1 : 0.35,
                      fontWeight: 700,
                      verticalAlign: "middle",
                      display: "inline-block",
                    }}
                  >
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                  {/* Tooltip */}
                  <span
                    style={{
                      visibility: hoveredCol === col ? "visible" : "hidden",
                      position: "absolute",
                      left: "50%",
                      top: 38,
                      transform: "translateX(-50%)",
                      background: colors.background2,
                      color: colors.font1,
                      padding: "8px 12px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      fontSize: 13,
                      fontWeight: 400,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    {metricTooltips[col]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((stat) => (
              <tr
                key={stat.column_name}
                style={{
                  borderBottom: `1px solid ${colors.background3}`,
                  color: colors.font2,
                  transition: "background 0.1s",
                  height: 50,
                }}
              >
                <td style={{ padding: "10px 16px", textAlign: "left" }}>
                  {stat.column_name}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  {formatNumber(stat.min)}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  {formatNumber(stat.max)}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  {formatNumber(stat.average)}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  {formatNumber(stat.median)}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  {formatNumber(stat.std_dev)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default DataOverview;
