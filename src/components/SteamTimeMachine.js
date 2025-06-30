import React, { useEffect, useState, useMemo, useRef } from "react";
import Plot from "react-plotly.js";
import Modal from "react-modal";
import { FaTimes, FaUserFriends, FaThumbsUp } from "react-icons/fa";
import { getReviewColor } from "../colors";

const DATA_URL = process.env.PUBLIC_URL + "/processed_data/steam_timeline.json";

const SteamTimeMachine = () => {
  const [data, setData] = useState([]);
  const [genre, setGenre] = useState("All");
  const [modalGame, setModalGame] = useState(null);
  const [allGenres, setAllGenres] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null); // {point, x, y}
  const plotRef = useRef();

  // Only allow these genres in the filter
  const allowedGenres = [
    "Indie",
    "Free To Play",
    "Casual",
    "Action",
    "Adventure",
    "Simulation",
    "RPG",
    "Strategy",
  ];

  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        // Collect all unique genres, but only keep allowed ones
        const genres = new Set();
        json.forEach((g) =>
          (g.genres || []).forEach((genre) => {
            if (allowedGenres.includes(genre)) genres.add(genre);
          })
        );
        setAllGenres(["All", ...allowedGenres.filter((g) => genres.has(g))]);
      });
  }, []);

  // Filter by genre
  const filteredData = useMemo(() => {
    if (genre === "All") return data;
    return data.filter((g) => g.genres && g.genres.includes(genre));
  }, [data, genre]);

  // Find min/max year for color scaling
  const minYear = useMemo(
    () => Math.min(...filteredData.map((g) => g.release_year)),
    [filteredData]
  );
  const maxYear = useMemo(
    () => Math.max(...filteredData.map((g) => g.release_year)),
    [filteredData]
  );

  // For color-coding x-axis labels
  const xTickVals = useMemo(() => {
    if (!filteredData.length) return [];
    const years = Array.from(
      new Set(filteredData.map((g) => g.release_year))
    ).sort((a, b) => a - b);
    return years;
  }, [filteredData]);
  const xTickText = useMemo(() => {
    // Color each year label according to the same gradient as points
    const normYear = (year) =>
      maxYear === minYear ? 0 : (year - minYear) / (maxYear - minYear);
    const lerpColor = (a, b, t) => {
      const ah = a.replace("#", "");
      const bh = b.replace("#", "");
      const ar = parseInt(ah.substring(0, 2), 16),
        ag = parseInt(ah.substring(2, 4), 16),
        ab = parseInt(ah.substring(4, 6), 16);
      const br = parseInt(bh.substring(0, 2), 16),
        bg = parseInt(bh.substring(2, 4), 16),
        bb = parseInt(bh.substring(4, 6), 16);
      const r = Math.round(ar + (br - ar) * t),
        g = Math.round(ag + (bg - ag) * t),
        blue = Math.round(ab + (bb - ab) * t);
      return `rgb(${r},${g},${blue})`;
    };
    return xTickVals.map((year) => {
      const t = normYear(year);
      const color = lerpColor("ffffff", "2196f3", t);
      return `<span style=\"color:${color};font-weight:600;\">${year}</span>`;
    });
  }, [xTickVals, minYear, maxYear]);

  // Prepare data for Plotly
  const plotData = useMemo(() => {
    // Color scale: white to #2196f3
    const colorScale = [
      [0, "#fff"],
      [1, "#2196f3"],
    ];
    // Normalize year to [0,1] for color
    const normYear = (year) =>
      maxYear === minYear ? 0 : (year - minYear) / (maxYear - minYear);
    // Size scale: based on estimated_owners
    const minOwners = Math.min(
      ...filteredData.map((g) => g.estimated_owners || 1)
    );
    const maxOwners = Math.max(
      ...filteredData.map((g) => g.estimated_owners || 1)
    );
    const scaleSize = () => 22; // Fixed size for all points
    return [
      {
        x: filteredData.map((g) => g.release_year),
        y: filteredData.map((g) => g.positive),
        text: filteredData.map((g) => g.name),
        customdata: filteredData.map((g) => [
          g.name,
          g.release_date,
          g.estimated_owners,
          g.positive,
          g.genre,
          g.avg_review_score,
        ]),
        mode: "markers",
        type: "scattergl",
        marker: {
          size: filteredData.map(() => scaleSize()),
          color: filteredData.map((g) => normYear(g.release_year)),
          colorscale: colorScale,
          cmin: 0,
          cmax: 1,
          opacity: 0.85,
          line: { width: 0 },
        },
        hovertemplate: null,
      },
    ];
  }, [filteredData, minYear, maxYear]);

  // Custom hover label styling for Plotly
  const layout = useMemo(
    () => ({
      autosize: true,
      height: 500,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        title: {
          text: "Release Year",
          standoff: 24,
        },
        tickmode: "array",
        tickvals: xTickVals,
        ticktext: xTickText,
        tickfont: {
          family: "Roboto, Arial, Helvetica, sans-serif",
          size: 15,
          color: "#fff", // fallback
        },
        ticklabeloverflow: "hide past domain",
        ticklabelposition: "outside",
        tickformat: "",
        ticklabelstep: 1,
        ticklabelpadding: 2,
        ticklabelangle: 0,
        ticklabelalign: "center",
        ticklabelmode: "array",
        ticklabel: { allowHTML: true },
        showgrid: true,
        gridcolor: "#23263a",
        zeroline: false,
        color: "#fff",
        fixedrange: false,
      },
      yaxis: {
        title: {
          text: "Positive Ratings",
          standoff: 24,
        },
        showgrid: true,
        gridcolor: "#23263a",
        zeroline: false,
        color: "#fff",
        fixedrange: false,
      },
      margin: { l: 60, r: 30, t: 30, b: 60 },
      font: { family: "inherit", size: 15, color: "#fff" },
      dragmode: "pan",
      hovermode: "closest",
      legend: { orientation: "h", y: -0.2 },
      hoverlabel: {
        bgcolor: "rgba(24,28,42,0.55)",
        bordercolor: "rgba(0,0,0,0)",
        font: { size: 18, color: "#fff" },
        align: "left",
      },
    }),
    [xTickVals, xTickText]
  );

  // Custom hovertemplate for pretty hover (disable Plotly hoverlabel)
  const hovertemplate = "<extra></extra>";
  if (plotData[0]) plotData[0].hovertemplate = hovertemplate;

  // Custom hover handler for Plotly
  const handleHover = (event) => {
    if (event && event.points && event.points.length > 0) {
      const pt = event.points[0];
      // Use pt.event if available, else window.event, else default
      const x = pt.event?.clientX ?? window.event?.clientX ?? 0;
      const y = pt.event?.clientY ?? window.event?.clientY ?? 0;
      setHoverInfo({
        point: pt.customdata,
        x,
        y,
      });
    } else {
      setHoverInfo(null);
    }
  };
  const handleUnhover = () => setHoverInfo(null);

  // Custom tooltip component
  const CustomTooltip = ({ info }) => {
    if (!info || !info.point) return null;
    const [
      name,
      release_date,
      estimated_owners,
      positive,
      genre,
      avg_review_score,
    ] = info.point;
    return (
      <div
        style={{
          position: "fixed",
          left: info.x + 18,
          top: info.y + 18,
          zIndex: 9999,
          minWidth: 260,
          maxWidth: 340,
          background: "rgba(24,28,42,0.65)",
          color: "#fff",
          borderRadius: 18,
          padding: "22px 28px",
          boxShadow: "0 4px 24px 0 #0008",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          fontSize: 17,
          pointerEvents: "none",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
          {name}
        </div>
        <div style={{ fontSize: 15, color: "#90caf9", marginBottom: 8 }}>
          {release_date} &middot; {genre}
        </div>
        <div
          style={{
            fontSize: 20,
            marginBottom: 2,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <FaUserFriends style={{ color: "#fff", fontSize: 20 }} />
          <b>{estimated_owners?.toLocaleString() || "?"}</b>
        </div>
        <div
          style={{
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <FaThumbsUp style={{ color: "#fff", fontSize: 20 }} />
          <b>{positive?.toLocaleString() || "?"}</b>
        </div>
      </div>
    );
  };

  // Handle click on a point
  const handlePointClick = (event) => {
    if (event && event.points && event.points.length > 0) {
      const idx = event.points[0].pointIndex;
      setModalGame(filteredData[idx]);
    }
  };

  // Re-add GameModal component for modal details
  const GameModal = ({ game, onClose }) => {
    if (!game) return null;
    return (
      <Modal
        isOpen={!!game}
        onRequestClose={onClose}
        ariaHideApp={false}
        style={{
          overlay: { background: "rgba(10,10,20,0.85)", zIndex: 10000 },
          content: {
            maxWidth: 700,
            margin: "auto",
            borderRadius: 16,
            background: "#181c2a",
            color: "#fff",
            border: "none",
            padding: 0,
            overflow: "auto",
          },
        }}
      >
        <div style={{ padding: 28, position: "relative" }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            <FaTimes />
          </button>
          <div style={{ fontWeight: 800, fontSize: 28, marginBottom: 8 }}>
            {game.name}
          </div>
          <div style={{ color: "#aaa", fontSize: 15, marginBottom: 12 }}>
            {game.release_date} &middot; {game.genre}
          </div>
          <div style={{ fontSize: 15, marginBottom: 18 }}>
            {game.short_description}
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            {game.screenshots &&
              game.screenshots.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="screenshot"
                  style={{
                    width: 180,
                    borderRadius: 8,
                    boxShadow: "0 2px 8px #0006",
                  }}
                />
              ))}
          </div>
          <div style={{ fontSize: 14, color: "#ccc", marginBottom: 8 }}>
            <b>Players:</b> {game.estimated_owners?.toLocaleString() || "?"}
          </div>
          <div style={{ fontSize: 14, color: "#ccc", marginBottom: 8 }}>
            <b>Positive Ratings:</b>{" "}
            <span style={{ color: getReviewColor(game.avg_review_score) }}>
              {game.positive?.toLocaleString() || "?"}
            </span>
          </div>
          <div style={{ fontSize: 14, color: "#ccc", marginBottom: 8 }}>
            <b>Developers:</b> {game.developers?.join(", ") || "?"}
          </div>
          <div style={{ fontSize: 14, color: "#ccc", marginBottom: 8 }}>
            <b>Publishers:</b> {game.publishers?.join(", ") || "?"}
          </div>
          <div style={{ fontSize: 14, color: "#ccc", marginBottom: 8 }}>
            <b>Genres:</b> {game.genres?.join(", ") || "?"}
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "#fff",
          marginBottom: "1.2rem",
          marginTop: 0,
          letterSpacing: "-1px",
          textShadow: "0 2px 8px rgba(0,0,0,0.15)",
          textAlign: "left",
        }}
      >
        Steam Time Machine
      </h2>
      <p
        style={{
          color: "#ccc",
          fontSize: "1.08rem",
          maxWidth: 700,
          margin: "0 0 24px 0",
        }}
      >
        This interactive timeline lets you explore the most popular Steam games
        released each year. Each point is a game, positioned by release year and
        number of positive ratings. Use the genre filter, zoom, and tooltips to
        discover trends, breakout hits, and how the Steam landscape has evolved
        over time.
      </p>
      <div style={{ textAlign: "left", marginBottom: 18 }}>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={{
            fontSize: 16,
            padding: "6px 18px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#181c2a",
            color: "#fff",
            fontWeight: 600,
            marginTop: 8,
          }}
        >
          {allGenres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div style={{ width: "100%", height: 500 }}>
        <Plot
          data={plotData}
          layout={layout}
          config={{
            responsive: true,
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false,
            modeBarButtonsToRemove: [
              "select2d",
              "lasso2d",
              "autoScale2d",
              "resetScale2d",
            ],
          }}
          onClick={handlePointClick}
          onHover={handleHover}
          onUnhover={handleUnhover}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
          ref={plotRef}
        />
      </div>
      <CustomTooltip info={hoverInfo} />
      <GameModal game={modalGame} onClose={() => setModalGame(null)} />
    </div>
  );
};

export default SteamTimeMachine;
