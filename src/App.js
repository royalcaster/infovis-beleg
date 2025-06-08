import React, { useState, useEffect } from "react";
import "./App.css";
import { colors } from "./colors";
import Header from "./components/Header";
import PositiveReviewsChart from "./components/PositiveReviewsChart";
import PlatformOwnersChart from "./components/PlatformOwnersChart";
import ReviewsOwnersScatterChart from "./components/ReviewsOwnersScatterChart";
import GenrePriceDominanceChart from "./components/GenrePriceDominanceChart";
import Q4ReleaseImpactChart from "./components/Q4ReleaseImpactChart";
import ReviewPriceChart from "./components/ReviewPriceChart";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [h1Data, setH1Data] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [h3Data, setH3Data] = useState(null);
  const [h4Data, setH4Data] = useState(null);
  const [h6Data, setH6Data] = useState(null);
  const [h7Data, setH7Data] = useState(null);
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
        const h3 = await fetchJson("h3_reviews_owners_scatter");
        const h4 = await fetchJson("h4_genre_price_dominance");
        const h6 = await fetchJson("h6_q4_release_impact");
        const h7 = await fetchJson("h7_median_review_vs_price");

        setH1Data(h1);
        setPlatformData(h2);
        setH3Data(h3);
        setH4Data(h4);
        setH6Data(h6);
        setH7Data(h7);
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
    fetch("/test.txt")
      .then((res) => {
        console.log("Test.txt response status:", res.status);
        return res.text();
      })
      .then((text) => console.log("Test.txt content:", text))
      .catch((err) => console.error("Test.txt error:", err));
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
        <div className={`loading-overlay ${fadeOut ? "fade-out" : ""}`}>
          <div className="spinner"></div>
          <h1>Loading Data...</h1>
        </div>
      )}

      <Header />
      <div className="gradient-div"></div>
      <main
        className="App-container"
        style={{ backgroundColor: colors.background1 }}
      >
        <div className="content-container">
          <PositiveReviewsChart data={h1Data} />
          <div style={{ height: 100 }}></div>
          <PlatformOwnersChart data={platformData} />
          <div style={{ height: 100 }}></div>
          <ReviewsOwnersScatterChart data={h3Data} />
          <div style={{ height: 100 }}></div>
          <GenrePriceDominanceChart data={h4Data} />
          <div style={{ height: 100 }}></div>
          <Q4ReleaseImpactChart data={h6Data} />
          <div style={{ height: 100 }}></div>
          <ReviewPriceChart data={h7Data} />
        </div>
      </main>
    </div>
  );
}

export default App;
