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
import BackgroundCarousels from "./components/BackgroundCarousels";
import SteamTimeMachine from "./components/SteamTimeMachine";
import DataOverview from "./components/DataOverview";

// Add a fullscreen loading spinner component
const LoadingSpinner = ({ visible }) => (
  <div
    className="fullscreen-spinner"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "#121622",
      zIndex: 9999,
      display: visible ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1)",
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "auto" : "none",
    }}
  >
    <div className="spinner-inner">
      <div className="spinner" />
      <span
        style={{
          color: "#fff",
          fontSize: 22,
          marginTop: 24,
          fontWeight: 600,
          letterSpacing: 1,
        }}
      >
        Loading...
      </span>
    </div>
  </div>
);

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
  const [showSpinner, setShowSpinner] = useState(true);
  const [generalInfo, setGeneralInfo] = useState(null);

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
          generalInfoResponse,
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
          fetch("/processed_data/general_info.json"),
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
          !carouselDataResponse.ok ||
          !generalInfoResponse.ok
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
          generalInfo,
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
          generalInfoResponse.json(),
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
        setGeneralInfo(generalInfo || null);
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

  useEffect(() => {
    // Show spinner for at least 1 second
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    // Don't show the default loading, let the spinner handle it
    return null;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Chart sections to render, in order
  const chartSections = [
    {
      component: GameOwnerCarousel,
      props: { data: data.carouselData },
      key: "carousel",
    },
    {
      component: ReviewPriceChart,
      props: { data: data.h7Data },
      key: "reviewPrice",
    },
    { component: DeveloperUniverse, props: {}, key: "devUniverse" },
    {
      component: ReviewPercentageOverTimeChart,
      props: { data: data.h1Data },
      key: "reviewOverTime",
    },
    {
      component: GenrePriceDominanceChart,
      props: { data: data.h4Data },
      key: "genrePrice",
    },
    {
      component: SteamTimeMachine,
      props: {},
      key: "steamTimeMachine",
    }
    // Add more chart components here as needed
  ];

  return (
    <div style={{ position: "relative", zIndex: 0 }}>
      <LoadingSpinner visible={showSpinner} />
      <BackgroundCarousels />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div className="App">
          <Header />
          <div className="gradient-div"></div>
          <div className="App-container">
            <div className="content-container">
              <div className="chart-grid">
                {generalInfo && (
                  <div className="chart-section-wrapper">
                    <DataOverview info={generalInfo} />
                  </div>
                )}
                {chartSections.map((section, idx) => {
                  const AlignComponent = section.component;
                  const align = idx % 2 === 0 ? "left" : "right";
                  return (
                    <div
                      className={`chart-section-wrapper ${align}`}
                      key={section.key}
                    >
                      <AlignComponent {...section.props} align={align} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
