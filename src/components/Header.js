import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { colors, hexToRgba } from "../colors";

const HEADER_HEIGHT = "250px";
const STICKY_HEADER_HEIGHT = "80px";
const SCROLL_SPEED_PIXELS_PER_SECOND = 40;
const MAX_IMAGES_FOR_CAROUSEL = 30;

const Header = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const filmstripRef = useRef(null);
  const animationFrameId = useRef(null);
  const singleSetWidthRef = useRef(0);
  const imagesLoadedCountRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const newIsSticky = scrollPosition > 100;

      if (newIsSticky !== isSticky) {
        // When becoming sticky, adjust scroll position to prevent jump
        if (newIsSticky) {
          window.scrollTo(0, scrollPosition - 1);
        }
        setIsSticky(newIsSticky);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSticky]);

  useEffect(() => {
    const fetchImageUrls = async () => {
      try {
        const response = await fetch(
          `${process.env.PUBLIC_URL}/processed_data/header_images.json`
        );
        if (!response.ok) throw new Error("Failed to fetch header images");
        const allData = await response.json();

        if (Array.isArray(allData) && allData.length > 0) {
          const limitedUrls = allData.slice(0, MAX_IMAGES_FOR_CAROUSEL);
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
      requestAnimationFrame(() => {
        if (!filmstripRef.current || imageUrls.length === 0) {
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

        if (currentSetWidth > 0) {
          setIsReadyToAnimate(true);
        } else {
          setIsReadyToAnimate(false);
        }
      });
    }
  }, [imageUrls.length]);

  useEffect(() => {
    if (
      !isReadyToAnimate ||
      imageUrls.length === 0 ||
      singleSetWidthRef.current === 0
    ) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    let lastTimestamp = 0;
    const animateScroll = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      setScrollOffset((prevOffset) => {
        let newOffset = prevOffset - SCROLL_SPEED_PIXELS_PER_SECOND * deltaTime;
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
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isReadyToAnimate, imageUrls.length]);

  const headerStyle = {
    position: isSticky ? "fixed" : "relative",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: "hidden",
    height: isSticky ? STICKY_HEADER_HEIGHT : HEADER_HEIGHT,
    backgroundColor: colors.background3,
    marginBottom: -1,
  };

  const carouselContainerStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    overflow: "hidden",
    transform: isSticky
      ? `translateY(${
          parseInt(HEADER_HEIGHT) - parseInt(STICKY_HEADER_HEIGHT)
        }px)`
      : "none",
    transition: "transform 0.3s ease-in-out",
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
    backgroundColor: isSticky
      ? hexToRgba(colors.background1, 0.5)
      : "transparent",
    backdropFilter: isSticky ? "blur(10px)" : "none",
    WebkitBackdropFilter: isSticky ? "blur(10px)" : "none",
    transition: "all 0.3s ease-in-out",
  };

  const contentContainerStyle = {
    display: "flex",
    flexDirection: isSticky ? "row" : "column",
    alignItems: "center",
    justifyContent: "center",
    padding: isSticky ? "0 20px" : "0 40px",
    maxWidth: "1200px",
    width: "100%",
    transition: "all 0.3s ease-in-out",
  };

  const titleContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: isSticky ? "center" : "flex-start",
    justifyContent: "center",
    padding: isSticky ? "0" : "30px",
    transition: "all 0.3s ease-in-out",
  };

  const titleStyle = {
    color: "white",
    margin: 0,
    textAlign: isSticky ? "center" : "left",
    fontSize: isSticky ? 24 : 35,
    fontWeight: 900,
    transition: "all 0.3s ease-in-out",
  };

  const subtitleStyle = {
    color: "white",
    margin: 0,
    fontSize: isSticky ? 12 : 15,
    marginTop: isSticky ? 5 : 10,
    textAlign: isSticky ? "center" : "left",
    transition: "all 0.3s ease-in-out",
  };

  const blurryContainerStyle = {
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: "10px",
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    display: "flex",
    flexDirection: "column",
    paddingRight: 40,
    paddingLeft: 40,
    backgroundColor: hexToRgba(colors.background1, 0.5),
    maxHeight: 210,
    transition: "all 0.3s ease-in-out",
  };

  const imagesToRender =
    imageUrls.length > 0 ? [...imageUrls, ...imageUrls] : [];

  return (
    <>
      <header className="App-header" style={headerStyle}>
        {imageUrls.length > 0 && (
          <div style={carouselContainerStyle}>
            <div ref={filmstripRef} style={filmstripStyle}>
              {imagesToRender.map((url, index) => (
                <img
                  key={`${url}-${index}`}
                  src={url}
                  alt={`Header background ${index % imageUrls.length}`}
                  style={imageStyle}
                  onLoad={
                    index < imageUrls.length ? handleImageLoad : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}
        <div style={contentOverlayStyle}>
          {isSticky ? (
            <div style={contentContainerStyle}>
              <div style={titleContainerStyle}>
                <p style={titleStyle}>Steam Games</p>
                <p style={subtitleStyle}>A visualization project</p>
              </div>
            </div>
          ) : (
            <div style={blurryContainerStyle}>
              <div
                style={{
                  flex: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 30,
                }}
              >
                <p style={titleStyle}>Steam Games</p>
                <p style={subtitleStyle}>A visualization project</p>
              </div>
              <div
                className="data-source-container"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <a
                  href="https://www.kaggle.com/datasets/artermiloff/steam-games-dataset"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="data-source-button"
                  style={{ margin: 0 }}
                >
                  <FaExternalLinkAlt />
                  <div style={{ width: 10 }}></div>
                  <span>View data source on Kaggle</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </header>
      {isSticky && <div style={{ height: HEADER_HEIGHT }} />}
    </>
  );
};

export default Header;
