import React, { useEffect, useState, useRef } from "react";

const ROW_HEIGHT = 200;
const SCROLL_SPEED = 40; // px/sec
const IMAGES_PER_ROW = 30;
const BLUR_AMOUNT = 14;
const DARK_OVERLAY = "rgba(10, 10, 20, 0.82)";

const BackgroundCarousels = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [scrollOffsets, setScrollOffsets] = useState([]);
  const [numRows, setNumRows] = useState(0);
  const rowWidths = useRef([]);
  const animationFrameId = useRef(null);

  // Dynamically set number of rows to fill viewport
  useEffect(() => {
    const updateRows = () => {
      const rows = Math.ceil(window.innerHeight / ROW_HEIGHT);
      setNumRows(rows);
      setScrollOffsets((prev) => {
        if (prev.length === rows) return prev;
        return Array(rows).fill(0);
      });
      rowWidths.current = Array(rows).fill(0);
    };
    updateRows();
    window.addEventListener("resize", updateRows);
    return () => window.removeEventListener("resize", updateRows);
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `${process.env.PUBLIC_URL}/processed_data/header_images.json`
        );
        if (!response.ok) throw new Error("Failed to fetch header images");
        const allData = await response.json();
        setImageUrls(
          Array.isArray(allData) ? allData.slice(0, IMAGES_PER_ROW) : []
        );
      } catch (e) {
        setImageUrls([]);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (imageUrls.length === 0 || numRows === 0) return;
    let lastTimestamp = 0;
    const animate = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      setScrollOffsets((prev) =>
        prev.map((offset, i) => {
          const dir = i % 2 === 0 ? -1 : 1;
          const width = rowWidths.current[i] || 1;
          let newOffset = offset + dir * SCROLL_SPEED * delta;
          // Loop seamlessly, always fill
          if (dir === -1 && newOffset <= -width) newOffset += width;
          if (dir === 1 && newOffset >= 0) newOffset -= width;
          return newOffset;
        })
      );
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [imageUrls, numRows]);

  // Helper to set row width after images load
  const setRowWidth = (rowIdx, el) => {
    if (el) {
      rowWidths.current[rowIdx] = el.scrollWidth / 2; // since we duplicate images
    }
  };

  if (imageUrls.length === 0 || numRows === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Blur and dark overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backdropFilter: `blur(${BLUR_AMOUNT}px)`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT}px)`,
          background: DARK_OVERLAY,
          zIndex: 1,
        }}
      />
      {/* Carousels */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        {Array.from({ length: numRows }).map((_, rowIdx) => {
          const dir = rowIdx % 2 === 0 ? -1 : 1;
          const offset = scrollOffsets[rowIdx] || 0;
          return (
            <div
              key={rowIdx}
              style={{
                position: "absolute",
                top: rowIdx * ROW_HEIGHT,
                left: 0,
                width: "100vw",
                height: ROW_HEIGHT,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              <div
                ref={(el) => setRowWidth(rowIdx, el)}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  transform: `translateX(${offset}px)`,
                  willChange: "transform",
                  height: ROW_HEIGHT,
                }}
              >
                {/* Duplicate images for seamless loop */}
                {[...imageUrls, ...imageUrls].map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="game header"
                    style={{
                      height: ROW_HEIGHT,
                      width: "auto",
                      margin: 0,
                      objectFit: "cover",
                      borderRadius: 0,
                      opacity: 0.85,
                      filter: "brightness(0.9)",
                      pointerEvents: "none",
                    }}
                    draggable={false}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BackgroundCarousels;
