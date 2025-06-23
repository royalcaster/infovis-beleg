import React, { useMemo } from "react";
import { colors } from "../colors";
import "./GameOwnerCarousel.css";

// Helper to parse owner string e.g., "1,584,464 - 1,584,464"
const parseOwnersMidpoint = (ownerStr) => {
  if (!ownerStr || typeof ownerStr !== "string") return 0;
  // Remove commas and split by ' - '
  const parts = ownerStr.replace(/,/g, "").split(" - ");
  try {
    const lower = parseInt(parts[0], 10);
    // Use the first part again if there is no upper bound
    const upper = parseInt(parts[1] || parts[0], 10);
    return (lower + upper) / 2;
  } catch (e) {
    console.error("Could not parse owner string:", ownerStr, e);
    return 0;
  }
};

const GameOwnerCarousel = ({ data }) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const items = data.map((game) => ({
      name: game.name,
      owners: parseOwnersMidpoint(game.estimated_owners),
      ownerStr: game.estimated_owners,
    }));

    const ownerCounts = items.map((g) => g.owners);
    const minOwners = Math.min(...ownerCounts);
    const maxOwners = Math.max(...ownerCounts);

    const minPixelSize = 10; // The absolute smallest a square can be
    const maxPixelSize = 300; // The size of the largest square

    return items.map((game) => {
      // Linear scale: map the owner count to a pixel size range
      const scale = (game.owners - minOwners) / (maxOwners - minOwners);
      const size = minPixelSize + scale * (maxPixelSize - minPixelSize);
      return { ...game, size };
    });
  }, [data]);

  if (!processedData.length) {
    return null;
  }

  return (
    <div className="carousel-container">
      <div className="carousel-track">
        {processedData.map((game, index) => {
          return (
            <div key={index} className="carousel-item">
              <div
                className="game-square-wrapper"
                style={{ height: `${game.size}px` }}
              >
                <svg
                  width={game.size}
                  height={game.size}
                  viewBox="0 0 100 100"
                  className="game-square"
                >
                  <rect width="100" height="100" fill={colors.accent7} />
                </svg>
              </div>
              <div className="game-label">
                <p className="game-name">{game.name}</p>
                <p className="game-owners">{game.ownerStr}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameOwnerCarousel; 