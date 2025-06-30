import React, { useState } from "react";
import ChartHeading from "./ChartHeading";
import { colors } from "../colors";

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

function getRelativePosition(value, min, max) {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

const DataOverview = ({ info }) => {
  const [sortColumn, setSortColumn] = useState("Metric");
  const [sortDirection, setSortDirection] = useState("asc");
  const [hoveredCol, setHoveredCol] = useState(null);

  if (!info) return null;
  const { total_games_analyzed, numeric_column_stats, free_vs_paid_counts } =
    info;

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
        background: colors.background2,
        borderRadius: 18,
        margin: "32px 0 40px 0",
        padding: "36px 36px 28px 36px",
        boxShadow: "0 4px 32px 0 #0005",
        maxWidth: 1200,
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        fontFamily: "Roboto, Arial, Helvetica, sans-serif",
      }}
    >
      <ChartHeading>Overview & Statistics</ChartHeading>
      <p
        style={{
          color: colors.font2,
          fontSize: "1.13rem",
          marginBottom: 32,
          maxWidth: 900,
          fontFamily: "Roboto",
          fontWeight: 400,
        }}
      >
        This section summarizes the main statistics of the Steam games dataset
        used in this app. It provides an overview of the data's size, key
        metrics, and distributions, helping you understand the scope and
        characteristics of the analyzed games.
      </p>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 32, marginBottom: 32 }}
      >
        <div style={{ minWidth: 220, flex: 1 }}>
          <div
            style={{
              color: colors.accent7,
              fontSize: 32,
              fontWeight: 900,
              marginBottom: 4,
              fontFamily: "Roboto",
            }}
          >
            {formatNumber(total_games_analyzed)}
          </div>
          <div
            style={{
              color: colors.font2,
              fontSize: 17,
              fontWeight: 600,
              fontFamily: "Roboto, Arial, Helvetica, sans-serif",
            }}
          >
            Total Games
          </div>
        </div>
        {free_vs_paid_counts &&
          free_vs_paid_counts.map((item) => (
            <div key={item.type} style={{ minWidth: 180, flex: 1 }}>
              <div
                style={{
                  color: item.type === "Free" ? colors.accent3 : colors.accent1,
                  fontSize: 28,
                  fontWeight: 700,
                  marginBottom: 4,
                  fontFamily: "Roboto, Arial, Helvetica, sans-serif",
                }}
              >
                {formatNumber(item.count)}
              </div>
              <div
                style={{
                  color: colors.font2,
                  fontSize: 16,
                  fontWeight: 500,
                  fontFamily: "Roboto, Arial, Helvetica, sans-serif",
                }}
              >
                {item.type} Games
              </div>
            </div>
          ))}
      </div>
      <div style={{ overflowX: "auto" }}>
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
                      background: "#23263a",
                      color: "#fff",
                      fontSize: 13,
                      padding: "7px 13px",
                      borderRadius: 8,
                      boxShadow: "0 2px 12px #0007",
                      zIndex: 10,
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      fontFamily: "Roboto, Arial, Helvetica, sans-serif",
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
                  background: colors.background1,
                  borderBottom: `1px solid ${colors.background3}`,
                }}
              >
                <td
                  style={{
                    padding: "10px 16px",
                    color: colors.font2,
                    fontWeight: 600,
                    textAlign: "left",
                    fontFamily: "Roboto, Arial, Helvetica, sans-serif",
                  }}
                >
                  {stat.column_name}
                </td>
                <td
                  style={{
                    padding: "10px 16px",
                    color: colors.font2,
                    textAlign: "right",
                    fontFamily: "Roboto, Arial, Helvetica, sans-serif",
                  }}
                >
                  {formatNumber(stat.min)}
                </td>
                <td
                  style={{
                    padding: "10px 16px",
                    color: colors.font2,
                    textAlign: "right",
                    fontFamily: "Roboto, Arial, Helvetica, sans-serif",
                  }}
                >
                  {formatNumber(stat.max)}
                </td>
                {/* Mean with mini bar */}
                <td
                  style={{
                    padding: "10px 16px",
                    color: colors.font2,
                    textAlign: "right",
                    position: "relative",
                    fontFamily: "Roboto, Arial, Helvetica, sans-serif",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        zIndex: 2,
                        marginRight: 18,
                      }}
                    >
                      {formatNumber(stat.average)}
                    </span>
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: 8,
                        width: "100%",
                        background: "rgba(33,150,243,0.10)",
                        borderRadius: 4,
                        zIndex: 1,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: `${
                          getRelativePosition(
                            stat.average,
                            stat.min,
                            stat.max
                          ) * 100
                        }%`,
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 16,
                        height: 16,
                        background: colors.accent7,
                        borderRadius: "50%",
                        boxShadow: "0 1px 6px #2196f355",
                        border: `2px solid ${colors.background2}`,
                        zIndex: 3,
                      }}
                      title="Mean position"
                    />
                  </div>
                </td>
                {/* Median with mini bar */}
                <td
                  style={{
                    padding: "10px 16px",
                    color: colors.font2,
                    textAlign: "right",
                    position: "relative",
                    fontFamily: "Roboto, Arial, Helvetica, sans-serif",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        zIndex: 2,
                        marginRight: 18,
                      }}
                    >
                      {formatNumber(stat.median)}
                    </span>
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: 8,
                        width: "100%",
                        background: "rgba(33,150,243,0.10)",
                        borderRadius: 4,
                        zIndex: 1,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: `${
                          getRelativePosition(stat.median, stat.min, stat.max) *
                          100
                        }%`,
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 16,
                        height: 16,
                        background: colors.accent3,
                        borderRadius: "50%",
                        boxShadow: "0 1px 6px #00c49f55",
                        border: `2px solid ${colors.background2}`,
                        zIndex: 3,
                      }}
                      title="Median position"
                    />
                  </div>
                </td>
                <td
                  style={{
                    padding: "10px 16px",
                    color: colors.font2,
                    textAlign: "right",
                    fontFamily: "Roboto, Arial, Helvetica, sans-serif",
                  }}
                >
                  {formatNumber(stat.std_dev)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DataOverview;
