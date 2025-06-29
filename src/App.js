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
import ReviewsOwnersBinnedChart from "./components/ReviewsOwnersBinnedChart";
import GameOwnerCarousel from "./components/GameOwnerCarousel";
import ChartHeading from "./components/ChartHeading";
import DeveloperUniverse from "./components/DeveloperUniverse";

const App = () => {
  const [data, setData] = useState({
    h1Data: [],
    h2Data: [],
    h3ScatterData: [],
    h3BinnedData: [],
    h4Data: [],
    h5Data: [],
    h6Data: [],
    h7Data: [],
    carouselData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          h1Response,
          h2Response,
          h3ScatterResponse,
          h3BinnedResponse,
          h4Response,
          h5Response,
          h6Response,
          h7Response,
          carouselDataResponse,
        ] = await Promise.all([
          fetch("/processed_data/h1_review_percentage_over_time.json"),
          fetch("/processed_data/h2_platforms_vs_owners.json"),
          fetch("/processed_data/h3_reviews_owners_scatter.json"),
          fetch("/processed_data/h3_reviews_owners_binned.json"),
          fetch("/processed_data/h4_genre_price_dominance.json"),
          fetch("/processed_data/h5_free_vs_paid.json"),
          fetch("/processed_data/h6_q4_release_impact.json"),
          fetch("/processed_data/h7_median_review_vs_price.json"),
          fetch("/processed_data/carousel_data.json"),
        ]);

        if (
          !h1Response.ok ||
          !h2Response.ok ||
          !h3ScatterResponse.ok ||
          !h3BinnedResponse.ok ||
          !h4Response.ok ||
          !h5Response.ok ||
          !h6Response.ok ||
          !h7Response.ok ||
          !carouselDataResponse.ok
        ) {
          throw new Error("Failed to fetch one or more data files");
        }

        const [
          h1Data,
          h2Data,
          h3ScatterData,
          h3BinnedData,
          h4Data,
          h5Data,
          h6Data,
          h7Data,
          carouselData,
        ] = await Promise.all([
          h1Response.json(),
          h2Response.json(),
          h3ScatterResponse.json(),
          h3BinnedResponse.json(),
          h4Response.json(),
          h5Response.json(),
          h6Response.json(),
          h7Response.json(),
          carouselDataResponse.json(),
        ]);

        setData({
          h1Data: h1Data || [],
          h2Data: h2Data || [],
          h3ScatterData: h3ScatterData || [],
          h3BinnedData: h3BinnedData || [],
          h4Data: h4Data || [],
          h5Data: h5Data || [],
          h6Data: h6Data || [],
          h7Data: h7Data || [],
          carouselData: carouselData || [],
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
            <div className="chart-section-wrapper">
              <GameOwnerCarousel data={data.carouselData} />
            </div>
            <div className="chart-section-wrapper">
              <DeveloperUniverse />
            </div>
            <div className="chart-section-wrapper">
              <ReviewPercentageOverTimeChart data={data.h1Data} />
            </div>
            {/* <div className="chart-section-wrapper">
              <PlatformsVsOwnersChart data={data.h2Data} />
            </div>
            <div className="chart-section-wrapper">
              <ReviewsOwnersBinnedChart data={data.h3BinnedData} />
            </div>
            <div className="chart-section-wrapper">
              <ReviewsOwnersScatterChart data={data.h3ScatterData} />
            </div> */}
            <div className="chart-section-wrapper">
              <GenrePriceDominanceChart data={data.h4Data} />
            </div>
            <div className="chart-section-wrapper">
              <FreeVsPaidChart data={data.h5Data} />
            </div>
            <div className="chart-section-wrapper">
              <Q4ReleaseImpactChart data={data.h6Data} />
            </div>
            <div className="chart-section-wrapper">
              <ReviewPriceChart data={data.h7Data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
