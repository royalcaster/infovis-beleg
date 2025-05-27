import React, { useState, useEffect } from "react";
import "./App.css";
import { colors } from "./colors";
import Header from "./components/Header";
import PositiveReviewsChart from "./components/PositiveReviewsChart";
import PlatformOwnersChart from "./components/PlatformOwnersChart";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [h1Data, setH1Data] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);

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
        const h2 = await fetchJson("h2_platforms_vs_owners");
        
        setH1Data(h1);
        setPlatformData(h2);
      } catch (err) {
        console.error("Failed to fetch processed data:", err);
        setError(err.message);
      } finally {
        setFadeOut(true);
        setTimeout(() => {
          setLoading(false);
        }, 500);
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

  if (error) {
    return (
      <div className="App-container error-message">
        <h1>Error Loading Data: {error}</h1>
      </div>
    );
  }

  return (
    <div className="App">
      {loading && (
        <div className={`loading-overlay ${fadeOut ? 'fade-out' : ''}`}>
          <div className="spinner"></div>
          <h1>Loading Data...</h1>
        </div>
      )}
      
      <Header />
      <div className="gradient-div"></div>
      <main className="App-container" style={{ backgroundColor: colors.background1 }}>
        <div className="content-container">
          <PositiveReviewsChart data={h1Data} />
          <div style={{height: 100}}></div>
          <PlatformOwnersChart data={platformData} />
        </div>
      </main>
    </div>
  );
}

export default App;
