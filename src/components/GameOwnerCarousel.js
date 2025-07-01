import React, { useState, useMemo, useRef, useEffect } from "react";
import { colors } from "../colors";
import "./GameOwnerCarousel.css";
import ChartHeading from "./ChartHeading";

// Helper to parse owner string
const parseOwnersMidpoint = (ownerStr) => {
  if (!ownerStr || typeof ownerStr !== "string") return 0;
  const parts = ownerStr.replace(/,/g, "").split(" - ");
  try {
    const lower = parseInt(parts[0], 10);
    const upper = parseInt(parts[1] || parts[0], 10);
    return (lower + upper) / 2;
  } catch (e) {
    console.error("Could not parse owner string:", ownerStr, e);
    return 0;
  }
};

const formatPlayerCount = (num) => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num;
};

const ITEMS_PER_PAGE = 7;
const ANCHOR_HEIGHT = 300; // The fixed height for the rightmost bar
const ITEM_WIDTH = 120; // Must match CSS
const ITEM_GAP = 30; // Must match CSS
const LABEL_WIDTH = 40; // px, increased space for the label and gap

const GameOwnerCarousel = (props) => {
  const { data, align = "left" } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [helperY, setHelperY] = useState([0, 0, 0]);
  const animRef = useRef();

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((game) => ({
      ...game,
      owners: parseOwnersMidpoint(game.estimated_owners),
      ownerStr: game.estimated_owners,
      imageUrl: game.header_image || "",
    }));
  }, [data]);

  // This calculates the new heights for ALL items, which will allow
  // the CSS transition to animate the height change smoothly for every bar.
  const displayItems = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];

    // Determine the anchor item which sets the scale for the current view
    const anchorIndex = Math.min(
      currentIndex + ITEMS_PER_PAGE - 1,
      processedData.length - 1
    );
    const anchorItem = processedData[anchorIndex];

    const k = anchorItem.owners > 0 ? ANCHOR_HEIGHT / anchorItem.owners : 0;

    return processedData.map((item) => ({
      ...item,
      height: Math.max(2, item.owners * k),
    }));
  }, [currentIndex, processedData]);

  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + 1, processedData.length - ITEMS_PER_PAGE)
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Calculate the offset to slide the track
  const trackOffset = currentIndex * (ITEM_WIDTH + ITEM_GAP);
  const trackStyle = {
    transform: `translateX(-${trackOffset}px)`,
  };

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= processedData.length - ITEMS_PER_PAGE;

  // Calculate the anchor and scaling
  const anchorIndex = Math.min(
    currentIndex + ITEMS_PER_PAGE - 1,
    processedData.length - 1
  );
  const anchorItem = processedData[anchorIndex];
  const k =
    anchorItem && anchorItem.owners > 0 ? ANCHOR_HEIGHT / anchorItem.owners : 0;

  // Target y positions for helper lines
  const helperValues = [10000, 100000, 1000000];
  const targetY = helperValues.map((value) => ANCHOR_HEIGHT - value * k);

  // Animate helperY to targetY
  useEffect(() => {
    let running = true;
    function animate() {
      setHelperY((prev) =>
        prev.map((y, i) => {
          const dest = targetY[i];
          if (y === undefined || isNaN(y)) return dest;
          const diff = dest - y;
          if (Math.abs(diff) < 1) return dest;
          return y + diff * 0.2; // Easing
        })
      );
      if (running && targetY.some((t, i) => Math.abs(t - helperY[i]) > 1)) {
        animRef.current = requestAnimationFrame(animate);
      }
    }
    animRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line
  }, [k, currentIndex]);

  // Helper lines for big numbers
  const helperLines = helperValues.map((value, i) => {
    const y = helperY[i];
    if (y < 0 || y > ANCHOR_HEIGHT) return null;
    return (
      <div
        key={value}
        className="helper-line"
        style={{
          position: "absolute",
          left: LABEL_WIDTH,
          right: 0,
          height: 0,
          borderTop: "1.5px dashed #fffa",
          top: `${y}px`,
          zIndex: 2,
          pointerEvents: "none",
          transition: "top 0.3s cubic-bezier(0.4,0,0.2,1)",
          opacity: 0.5,
        }}
      >
        <span
          style={{
            position: "absolute",
            left: -LABEL_WIDTH,
            width: LABEL_WIDTH - 12,
            top: -8,
            color: "#fffa",
            fontSize: 12,
            borderRadius: 4,
            fontWeight: 600,
            opacity: 0.7,
            background: "none",
            padding: 0,
            textAlign: "right",
            display: "inline-block",
            lineHeight: "16px",
          }}
        >
          {value >= 1000000
            ? `${value / 1000000}M`
            : value >= 1000
            ? `${value / 1000}K`
            : value}
        </span>
      </div>
    );
  });

  if (processedData.length === 0) {
    return null;
  }

  return (
    <div>
      <div style={{ height: 180 }}></div>
      <div className={`chart-heading-block ${align}`}>
        <ChartHeading align={align}>Player counts</ChartHeading>
        <p
          style={{
            color: "#ccc",
            fontSize: "1.08rem",
            maxWidth: 700,
            margin: "0 0 24px 0",
          }}
        >
          This chart lets you compare the estimated number of players (owners)
          for different games on Steam. Each bar represents a game, with its
          length showing the relative player count. Use the arrows to scroll
          through more games and see how popular different titles are.
        </p>
      </div>
      <div className="carousel-container">
        <button
          className="nav-button prev"
          onClick={handlePrev}
          disabled={isPrevDisabled}
        ></button>

        <div className="carousel-viewport" style={{ position: "relative" }}>
          {helperLines}
          <div className="carousel-track" style={trackStyle}>
            {displayItems.map((game) => (
              <div key={game.name} className="carousel-item">
                <span className="player-count">
                  {formatPlayerCount(game.owners)}
                </span>
                <div
                  className="game-bar"
                  style={{
                    height: `${game.height}px`,
                    backgroundColor: colors.accent7,
                  }}
                ></div>
                <div className="game-label">
                  <p className="game-name">{game.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="nav-button next"
          onClick={handleNext}
          disabled={isNextDisabled}
        ></button>
      </div>
    </div>
  );
};

export default GameOwnerCarousel;
