import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import Header from "./components/Header";
import ReviewsOwnersScatterChart from "./components/ReviewsOwnersScatterChart";
import GenrePriceDominanceChart from "./components/GenrePriceDominanceChart";
import Q4ReleaseImpactChart from "./components/Q4ReleaseImpactChart";
import ReviewPriceChart from "./components/ReviewPriceChart";
import ReviewPercentageOverTimeChart from "./components/ReviewPercentageOverTimeChart";
import PlatformsVsOwnersChart from "./components/PlatformsVsOwnersChart";
import FreeVsPaidChart from "./components/FreeVsPaidChart";
import FilterPanel from "./components/FilterPanel";

const App = () => {
  const [data, setData] = useState({
    h1Data: [],
    h2Data: [],
    h3Data: [],
    h4Data: [],
    h5Data: [],
    h6Data: [],
    h7Data: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          h1Response,
          h2Response,
          h3Response,
          h4Response,
          h5Response,
          h6Response,
          h7Response,
        ] = await Promise.all([
          fetch("/processed_data/h1_review_percentage_over_time.json"),
          fetch("/processed_data/h2_platforms_vs_owners.json"),
          fetch("/processed_data/h3_reviews_owners_scatter.json"),
          fetch("/processed_data/h4_genre_price_dominance.json"),
          fetch("/processed_data/h5_free_vs_paid.json"),
          fetch("/processed_data/h6_q4_release_impact.json"),
          fetch("/processed_data/h7_median_review_vs_price.json"),
        ]);

        if (
          !h1Response.ok ||
          !h2Response.ok ||
          !h3Response.ok ||
          !h4Response.ok ||
          !h5Response.ok ||
          !h6Response.ok ||
          !h7Response.ok
        ) {
          throw new Error("Failed to fetch one or more data files");
        }

        const [h1Data, h2Data, h3Data, h4Data, h5Data, h6Data, h7Data] =
          await Promise.all([
            h1Response.json(),
            h2Response.json(),
            h3Response.json(),
            h4Response.json(),
            h5Response.json(),
            h6Response.json(),
            h7Response.json(),
          ]);

        setData({
          h1Data: h1Data || [],
          h2Data: h2Data || [],
          h3Data: h3Data || [],
          h4Data: h4Data || [],
          h5Data: h5Data || [],
          h6Data: h6Data || [],
          h7Data: h7Data || [],
        });
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(
          "Failed to load data. Please check the console for more details."
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="App">
      <Header />
      <div className="gradient-div"></div>
      <div className="App-container">
        <div className="content-container">
          <div className="chart-grid">
            <ReviewPercentageOverTimeChart data={data.h1Data} />
            <PlatformsVsOwnersChart data={data.h2Data} />
            <ReviewsOwnersScatterChart data={data.h3Data} />
            <GenrePriceDominanceChart data={data.h4Data} />
            <FreeVsPaidChart data={data.h5Data} />
            <Q4ReleaseImpactChart data={data.h6Data} />
            <ReviewPriceChart data={data.h7Data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
