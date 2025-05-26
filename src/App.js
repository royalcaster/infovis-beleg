import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";
import "./App.css"; // Assuming you have some basic CSS
import { colors } from "./colors";
import { FaExternalLinkAlt } from "react-icons/fa";

// Helper functions (place outside the App component)
const formatNumber = (num, precision = 1) => {
  if (num === null || num === undefined || num === "N/A") return "N/A";
  if (typeof num === "string" && isNaN(parseFloat(num))) return num;

  const numericValue = parseFloat(num);
  if (isNaN(numericValue)) return "N/A";

  if (precision === 0 && Number.isInteger(numericValue))
    return numericValue.toString();

  if (Math.abs(numericValue) >= 1000000000)
    return (numericValue / 1000000000).toFixed(precision) + "B";
  if (Math.abs(numericValue) >= 1000000)
    return (numericValue / 1000000).toFixed(precision) + "M";
  if (Math.abs(numericValue) >= 1000)
    return (numericValue / 1000).toFixed(precision) + "K";

  return typeof numericValue === "number"
    ? numericValue.toFixed(Math.min(precision, 2))
    : numericValue;
};

const formatPercentage = (num) => {
  if (num === null || num === undefined || num === "N/A") return "N/A";
  const numericValue = parseFloat(num);

  if (isNaN(numericValue)) {
    return typeof num === 'string' && num.includes('%') ? num : String(num);
  }

  // Round to the nearest integer before converting to string
  const integerPercentage = Math.round(numericValue);
  return integerPercentage + "%";
};

// New formatter for Y-axis ticks to hide "0%"
const formatYAxisTick = (tickValue) => {
  if (tickValue === 0) {
    return ''; // Return an empty string for the 0% label
  }
  return formatPercentage(tickValue); // Use the integer percentage formatter
};

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [h1Data, setH1Data] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchJson = async (fileName) => {
          const response = await fetch(`/processed_data/${fileName}.json`);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch ${fileName}: ${response.status} ${response.statusText}`
            );
          }
          return response.json();
        };

        const h1 = await fetchJson("h1_review_percentage_over_time");
        setH1Data(h1);
      } catch (err) {
        console.error("Failed to fetch processed data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on component mount

  if (loading) {
    return (
      <div className="App-container">
        <h1>Loading Data...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App-container error-message">
        <h1>Error Loading Data: {error}</h1>
      </div>
    );
  }

  return (
    <div className="App">

      <header className="App-header" style={{ backgroundColor: colors.background3 }}>
        <div style={{height: 30}}></div>
        <h1 style={{color: "white"}}>Steam Games</h1>
        <div style={{height: 20}}></div>
        <div className="data-source-container">
          <a
            href="https://www.kaggle.com/datasets/artermiloff/steam-games-dataset" // Replace with your actual Kaggle link
            target="_blank"
            rel="noopener noreferrer"
            className="data-source-button"
          >
            <FaExternalLinkAlt />
            <div style={{width: 10}}></div>
            <span>View data source on Kaggle</span>
          </a>
        </div>
        <div style={{height: 20}}></div>
      </header>

      <main className="App-container" style={{ backgroundColor: colors.background1 }}>
        <div className="content-container">
      
        {/* Hypothesis 1: Avg Positive Review % Over Time */}
        {h1Data && h1Data.length > 0 && (
          <section className="chart-section">
            <h1 className="chart-title">Positive reviews over time</h1>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={h1Data}
                margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="6 6" stroke={colors.background3} />
                <XAxis
                  dataKey="release_year"
                  name="Release Year"
                  stroke={colors.font2}
                  tick={{ fill: colors.font2, fontSize: 14 }}
                >
                  <Label
                    value="Release Year"
                    offset={-15}
                    position="insideBottom"
                    style={{ fill: colors.font2, fontSize: 14, textAnchor: 'middle' }}
                  />
                </XAxis>
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={formatYAxisTick} // Use the new formatter here
                  allowDecimals={false}
                  stroke={colors.font2}
                  tick={{ fill: colors.font2, fontSize: 14 }}
                />
                <Tooltip
                  formatter={(value) => formatPercentage(value)} // Tooltip can still use the standard one
                  contentStyle={{
                    backgroundColor: 'rgba(40, 40, 40, 0.9)',
                    borderColor: 'rgba(60, 60, 60, 0.9)',
                    borderRadius: '5px',
                    color: colors.font2
                  }}
                  labelStyle={{ color: colors.font2, fontWeight: 'bold' }}
                  itemStyle={{ color: colors.font2 }}
                />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{paddingBottom: '20px' }}
                  formatter={(value, entry, index) => <span style={{ color: colors.blue }}>{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="avg_positive_percentage"
                  stroke={colors.blue}
                  strokeWidth={3}
                  activeDot={{ r: 10, fill: colors.blue, stroke: colors.font2, strokeWidth: 2 }}
                  name="Average positive review percentage "
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}
        {h1Data && h1Data.length === 0 && (
          <section className="chart-section">
            <h2>H1: Avg. Positive Review % Over Time</h2>
            <p>No data available for this hypothesis.</p>
          </section>
        )}
        </div>
      </main>
    </div>
  );
}

export default App;
