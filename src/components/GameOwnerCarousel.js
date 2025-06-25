import React, { useState, useMemo } from "react";
import { colors } from "../colors";
import "./GameOwnerCarousel.css";

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

const GameOwnerCarousel = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  if (processedData.length === 0) {
    return null;
  }

  return (
    <div className="carousel-container">
      <button
        className="nav-button prev"
        onClick={handlePrev}
        disabled={isPrevDisabled}
      ></button>

      <div className="carousel-viewport">
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
  );
};

export default GameOwnerCarousel; 