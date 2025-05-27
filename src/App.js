import React, { useState, useEffect } from "react";
import "./App.css";
import { colors } from "./colors";
import Header from "./components/Header";
import PositiveReviewsChart from "./components/PositiveReviewsChart";

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

  const integerPercentage = Math.round(numericValue);
  return integerPercentage + "%";
};

const formatYAxisTick = (tickValue) => {
  if (tickValue === 0) {
    return '';
  }
  return formatPercentage(tickValue);
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
  }, []);

  useEffect(() => {
    fetch('/test.txt')
      .then(res => {
        console.log('Test.txt response status:', res.status);
        return res.text();
      })
      .then(text => console.log('Test.txt content:', text))
      .catch(err => console.error('Test.txt error:', err));
  }, []);

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
      <Header />
      <div className="gradient-div"></div>
      <main className="App-container" style={{ backgroundColor: colors.background1 }}>
        <div className="content-container">
          <PositiveReviewsChart data={h1Data} />
        </div>
      </main>
    </div>
  );
}

export default App;
