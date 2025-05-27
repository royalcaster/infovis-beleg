import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { colors, hexToRgba } from "../colors";

const HEADER_HEIGHT = "250px";
const SCROLL_SPEED_PIXELS_PER_SECOND = 40;
const MAX_IMAGES_FOR_CAROUSEL = 30;

const Header = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const filmstripRef = useRef(null);
  const animationFrameId = useRef(null);
  const singleSetWidthRef = useRef(0);
  const imagesLoadedCountRef = useRef(0);

  useEffect(() => {
    const fetchImageUrls = async () => {
      // console.log("Fetching image URLs...");
      try {
        const response = await fetch(
          `${process.env.PUBLIC_URL}/processed_data/header_images.json`,
        );
        if (!response.ok) throw new Error("Failed to fetch header images");
        const allData = await response.json();

        if (Array.isArray(allData) && allData.length > 0) {
          const limitedUrls = allData.slice(0, MAX_IMAGES_FOR_CAROUSEL);
          // console.log("Limited image URLs set:", limitedUrls.length);
          setImageUrls(limitedUrls);
          imagesLoadedCountRef.current = 0;
          setIsReadyToAnimate(false);
          singleSetWidthRef.current = 0;

          limitedUrls.forEach((url) => {
            if (url) new Image().src = url;
          });
        } else {
          setImageUrls([]);
        }
      } catch (error) {
        console.error("Error fetching or processing header images:", error);
        setImageUrls([]);
      }
    };
    fetchImageUrls();
  }, []);

  const handleImageLoad = useCallback(() => {
    imagesLoadedCountRef.current += 1;

    if (
      imageUrls.length > 0 &&
      imagesLoadedCountRef.current === imageUrls.length &&
      filmstripRef.current
    ) {
      // Defer width calculation to the next animation frame
      // This ensures layout is stable before reading offsetWidth
      requestAnimationFrame(() => {
        if (!filmstripRef.current || imageUrls.length === 0) {
          // Component might have unmounted or imageUrls reset
          setIsReadyToAnimate(false);
          return;
        }

        let currentSetWidth = 0;
        const imagesInDom = filmstripRef.current.children;
        for (let i = 0; i < imageUrls.length; i++) {
          if (imagesInDom[i]) {
            currentSetWidth += imagesInDom[i].offsetWidth;
          }
        }
        singleSetWidthRef.current = currentSetWidth;
        // console.log("All images loaded (rAF). Single set width:", currentSetWidth);

        if (currentSetWidth > 0) {
          setIsReadyToAnimate(true);
        } else {
          // If width is still 0, we are not ready.
          setIsReadyToAnimate(false);
          // console.warn("Calculated set width is 0 (rAF). Not starting animation.");
        }
      });
    }
  }, [imageUrls.length]); // Dependency is correct

  useEffect(() => {
    if (
      !isReadyToAnimate ||
      imageUrls.length === 0 ||
      singleSetWidthRef.current === 0
    ) {
      // console.log("Animation prerequisites not met or stopping.");
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    // console.log("Starting/Continuing animation...");
    let lastTimestamp = 0;
    const animateScroll = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      setScrollOffset((prevOffset) => {
        let newOffset =
          prevOffset - SCROLL_SPEED_PIXELS_PER_SECOND * deltaTime;
        // Ensure singleSetWidthRef.current is positive before using in modulo-like logic
        if (
          singleSetWidthRef.current > 0 &&
          newOffset <= -singleSetWidthRef.current
        ) {
          newOffset += singleSetWidthRef.current;
        }
        return newOffset;
      });
      animationFrameId.current = requestAnimationFrame(animateScroll);
    };

    animationFrameId.current = requestAnimationFrame(animateScroll);

    return () => {
      // console.log("Cleaning up animation frame.");
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isReadyToAnimate, imageUrls.length]); // Dependencies are correct

  const headerStyle = {
    position: "relative",
    overflow: "hidden",
    height: HEADER_HEIGHT,
    backgroundColor: colors.background3,
  };

  const filmstripStyle = {
    display: "flex",
    height: "100%",
    transform: `translateX(${scrollOffset}px)`,
    willChange: "transform",
  };

  const imageStyle = {
    height: "100%",
    width: "auto",
    flexShrink: 0,
    objectFit: "cover",
  };

  const contentOverlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hexToRgba(colors.background1, 0.25)
  };

  const imagesToRender =
    imageUrls.length > 0 ? [...imageUrls, ...imageUrls] : [];

  return (
    <header className="App-header" style={headerStyle}>
      {imageUrls.length > 0 && (
        <div ref={filmstripRef} style={filmstripStyle}>
          {imagesToRender.map((url, index) => (
            <img
              key={`${url}-${index}`}
              src={url}
              alt={`Header background ${index % imageUrls.length}`}
              style={imageStyle}
              onLoad={index < imageUrls.length ? handleImageLoad : undefined}
            />
          ))}
        </div>
      )}
      <div style={contentOverlayStyle}>
            <div style={{
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                borderRadius: "10px",
                border: `1px solid rgba(255, 255, 255, 0.2)`,
                display: "flex",
                flexDirection: "column",
                paddingRight: 40,
                paddingLeft: 40,
                backgroundColor: hexToRgba(colors.background1, 0.5),
                maxHeight: 210
            }}>
                <div style={{flex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30}}>
                    <p style={{color: "white", margin: 0, textAlign: "left", fontSize: 35, fontWeight: 900}}>Steam Games</p>
                    <p style={{color: "white", margin: 0, fontSize: 15, marginTop: 10}}>A visualization project</p>
                </div>
                <div className="data-source-container" style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <a
                        href="https://www.kaggle.com/datasets/artermiloff/steam-games-dataset"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="data-source-button"
                        style={{margin: 0}}
                    >
                        <FaExternalLinkAlt />
                        <div style={{ width: 10 }}></div>
                        <span>View data source on Kaggle</span>
                    </a>
                </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
