import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import * as d3 from "d3";
import ForceGraph2D from "react-force-graph-2d";
import ChartHeading from "./ChartHeading";
import {
  FaUserTie,
  FaGamepad,
  FaStar,
  FaUsers,
  FaLink,
  FaExpand,
  FaCompress,
  FaRedo,
} from "react-icons/fa";

function getReviewColor(percent) {
  // Clamp percent between 30 and 95
  const p = Math.max(30, Math.min(95, percent));
  // Linear interpolation: 30% = red (#d7191c), 95% = green (#1a9641)
  // We'll interpolate in RGB space
  const r1 = 215,
    g1 = 25,
    b1 = 28; // #d7191c
  const r2 = 26,
    g2 = 150,
    b2 = 65; // #1a9641
  const t = (p - 30) / (95 - 30);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

const DeveloperUniverse = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [showOrphanNodes, setShowOrphanNodes] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const graphRef = React.useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef(null);

  useEffect(() => {
    fetch("/processed_data/developer_universe.json")
      .then((response) => response.json())
      .then((data) => {
        setGraphData(data);
        setLoading(false);
      });
  }, []);

  const processedGraphData = useMemo(() => {
    if (!graphData.nodes.length) return { nodes: [], links: [] };

    const connectedNodeIds = new Set();
    graphData.links.forEach((link) => {
      connectedNodeIds.add(link.source);
      connectedNodeIds.add(link.target);
    });

    let filteredNodes = graphData.nodes;
    if (!showOrphanNodes) {
      filteredNodes = graphData.nodes.filter((node) =>
        connectedNodeIds.has(node.id)
      );
    }
    // Only show nodes with more than 5 games
    filteredNodes = filteredNodes.filter((node) => (node.game_count || 0) > 5);

    // Create size and color scales
    const maxGames = Math.max(...filteredNodes.map((n) => n.game_count || 1));
    const minGames = Math.min(...filteredNodes.map((n) => n.game_count || 1));

    // Use a linear scale for game_count, with a wider range for more visual difference
    const sizeScale = d3
      .scaleLinear()
      .domain([minGames > 0 ? minGames : 1, maxGames])
      .range([10, 2000]);

    // Domain for review scores is roughly 0-100%
    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain([30, 95]); // Use a more focused range for better color distinction

    const finalNodes = filteredNodes.map((node) => {
      // Node size based on number of games
      const size = sizeScale(node.game_count || 1);
      // Node color based on average review score
      const color = colorScale(node.avg_review_score || 0);
      return { ...node, size, color };
    });

    // If hiding orphans, also filter links to be safe
    const finalLinks = graphData.links.filter((link) => {
      const sourceNode = finalNodes.find((n) => n.id === link.source);
      const targetNode = finalNodes.find((n) => n.id === link.target);
      return sourceNode && targetNode;
    });

    // Add neighbor data for highlighting
    const nodesById = new Map(finalNodes.map((node) => [node.id, node]));
    finalNodes.forEach((node) => {
      node.neighbors = [];
      node.links = [];
    });
    finalLinks.forEach((link) => {
      const sourceNode = nodesById.get(link.source);
      const targetNode = nodesById.get(link.target);
      if (sourceNode && targetNode) {
        sourceNode.neighbors.push(targetNode);
        targetNode.neighbors.push(sourceNode);
        sourceNode.links.push(link);
        targetNode.links.push(link);
      }
    });

    return { nodes: finalNodes, links: finalLinks };
  }, [graphData, showOrphanNodes]);

  useEffect(() => {
    if (!loading && graphRef.current && processedGraphData.nodes.length > 0) {
      // Timeout ensures the graph is rendered before fitting
      setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.d3ReheatSimulation();
          graphRef.current.zoomToFit(1200);
        }
      }, 500);
    }
  }, [loading, processedGraphData]);

  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node);
  }, []);

  const handleResetLayout = () => {
    if (graphRef.current) {
      graphRef.current.d3ReheatSimulation();
      graphRef.current.zoomToFit(100);
    }
  };

  // Fullscreen API logic
  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (fullscreenRef.current.requestFullscreen) {
        fullscreenRef.current.requestFullscreen();
      } else if (fullscreenRef.current.webkitRequestFullscreen) {
        fullscreenRef.current.webkitRequestFullscreen();
      } else if (fullscreenRef.current.mozRequestFullScreen) {
        fullscreenRef.current.mozRequestFullScreen();
      } else if (fullscreenRef.current.msRequestFullscreen) {
        fullscreenRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change to update state
  useEffect(() => {
    const handleChange = () => {
      const fsElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!fsElement);
    };
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    document.addEventListener("mozfullscreenchange", handleChange);
    document.addEventListener("MSFullscreenChange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      document.removeEventListener("mozfullscreenchange", handleChange);
      document.removeEventListener("MSFullscreenChange", handleChange);
    };
  }, []);

  if (loading) {
    return <div>Loading Developer Universe...</div>;
  }

  const formatOwners = (owners) => {
    if (owners > 1000000) {
      return `${(owners / 1000000).toFixed(1)}M+`;
    }
    if (owners > 1000) {
      return `${Math.round(owners / 1000)}K+`;
    }
    return owners;
  };

  return (
    <div>
      <h1
        style={{
          color: "#fff",
          fontSize: "2.2rem",
          marginBottom: 8,
          marginTop: 0,
        }}
      >
        Developers & Publishers
      </h1>
      <p
        style={{
          color: "#ccc",
          fontSize: "1.08rem",
          maxWidth: 700,
          margin: "0 0 24px 0",
        }}
      >
        This network graph visualizes the relationships between game developers
        and publishers on Steam. Each node represents a developer or publisher,
        with node size indicating the number of games they are associated with.
        The color of each node reflects the average review score of their games
        (from red for lower scores to green for higher scores). Connections
        (edges) between nodes indicate that the connected developers or
        publishers have collaborated on at least one game.
      </p>
      {/* Interactive area and legend in a column flex container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {/* Interactive area: hover + graph */}
        <div
          ref={fullscreenRef}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            width: "100%",
            height: isFullscreen ? "100vh" : 550,
            margin: 0,
            padding: 0,
            position: isFullscreen ? "fixed" : "relative",
            top: isFullscreen ? 0 : undefined,
            left: isFullscreen ? 0 : undefined,
            zIndex: isFullscreen ? 9999 : "auto",
            background: isFullscreen ? "rgba(10,10,20,0.95)" : "none",
            transition: "all 0.2s",
          }}
        >
          {/* Details container */}
          <div
            style={{
              width: 320,
              minWidth: 320,
              maxWidth: 320,
              height: 500,
              background: "rgba(20, 20, 30, 0.7)",
              color: "#fff",
              borderRadius: 16,
              padding: 28,
              marginRight: 0,
              marginTop: 0,
              boxShadow: "0 4px 24px 0 #0008",
              fontSize: 16,
              wordBreak: "break-word",
              whiteSpace: "pre-line",
              overflowWrap: "break-word",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 18,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              transition: "height 0.2s",
            }}
          >
            {hoveredNode ? (
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    color: "#aaa",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 2,
                    letterSpacing: 0.5,
                  }}
                >
                  {hoveredNode.type &&
                    hoveredNode.type.charAt(0).toUpperCase() +
                      hoveredNode.type.slice(1)}
                </div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 30,
                    marginBottom: 28,
                    color: "#C021E9",
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                    overflowWrap: "break-word",
                    textAlign: "left",
                    letterSpacing: 0.2,
                  }}
                >
                  {hoveredNode.id}
                </div>
                {/* Stat row: Games, Players */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 40,
                    marginBottom: 18,
                    marginTop: 8,
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  {/* Games */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <FaGamepad
                      style={{ color: "white", fontSize: 22, flexShrink: 0 }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          color: "#ccc",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: 0.5,
                          marginBottom: 2,
                        }}
                      >
                        GAMES
                      </span>
                      <span
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 18,
                          lineHeight: 1,
                        }}
                      >
                        {hoveredNode.game_count}
                      </span>
                    </div>
                  </div>
                  {/* Players */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <FaUsers
                      style={{ color: "white", fontSize: 22, flexShrink: 0 }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          color: "#ccc",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: 0.5,
                          marginBottom: 2,
                        }}
                      >
                        PLAYERS
                      </span>
                      <span
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 18,
                          lineHeight: 1,
                        }}
                      >
                        {formatOwners(hoveredNode.total_owners)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Reviews as a color-coded pill */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 28,
                    marginTop: 0,
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      background: getReviewColor(hoveredNode.avg_review_score),
                      borderRadius: 16,
                      padding: "4px 18px",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 17,
                      letterSpacing: 0.2,
                      minWidth: 70,
                      textAlign: "center",
                      boxShadow: "0 1px 6px 0 #0004",
                      border: "none",
                      display: "inline-block",
                    }}
                  >
                    {hoveredNode.avg_review_score}%
                  </span>
                </div>
                {hoveredNode.neighbors && hoveredNode.neighbors.length > 0 && (
                  <div style={{ marginTop: 10, width: "100%" }}>
                    <div
                      style={{
                        color: "#aaa",
                        fontSize: 15,
                        fontWeight: 500,
                        marginBottom: 8,
                      }}
                    >
                      Related
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      {hoveredNode.neighbors.slice(0, 10).map((n) => (
                        <span
                          key={n.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px 14px 2px 10px",
                            borderRadius: 20,
                            background: "#2196F3",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: 15,
                            border: "none",
                            whiteSpace: "nowrap",
                            letterSpacing: 0.1,
                          }}
                        >
                          {n.id}
                        </span>
                      ))}
                    </div>
                    {hoveredNode.neighbors.length > 10 && (
                      <div
                        style={{ color: "#aaa", fontSize: 14, marginTop: 6 }}
                      >
                        and {hoveredNode.neighbors.length - 10} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: "#aaa", fontSize: 16, marginTop: 40 }}>
                Hover a node to see details
              </div>
            )}
          </div>
          {/* Chart container */}
          <div
            style={{
              flex: 1,
              width: "100%",
              height: isFullscreen ? "100vh" : 550,
              position: "relative",
              overflow: "hidden",
              background: "transparent",
              transition: "height 0.2s",
            }}
          >
            {/* Reset button (top right) */}
            <button
              onClick={handleResetLayout}
              title="Reset"
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                zIndex: 10,
                background: "rgba(30,30,40,0.85)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "7px 13px",
                fontSize: 16,
                fontWeight: 600,
                boxShadow: "0 2px 8px #0004",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
                transition: "background 0.2s",
              }}
            >
              <FaRedo style={{ fontSize: 15, marginRight: 4 }} /> Reset
            </button>

            <ForceGraph2D
              ref={graphRef}
              graphData={processedGraphData}
              nodeLabel={() => ""} // Hide hover inside the graph
              nodeVal="size"
              nodeColor={(node) => {
                if (
                  hoveredNode &&
                  hoveredNode.neighbors.some((n) => n.id === node.id)
                ) {
                  return "#1085F0"; // Blue for neighbors
                }
                if (hoveredNode && node.id === hoveredNode.id) {
                  return "#C021E9"; // Purple for hovered node
                }
                return node.color;
              }}
              linkColor={(link) => {
                const sourceId =
                  typeof link.source === "object"
                    ? link.source.id
                    : link.source;
                const targetId =
                  typeof link.target === "object"
                    ? link.target.id
                    : link.target;
                const isHoveredLink =
                  hoveredNode &&
                  (sourceId === hoveredNode.id || targetId === hoveredNode.id);
                return isHoveredLink
                  ? "#1085F0" // Blue for hovered links
                  : "rgba(255,255,255,0.2)";
              }}
              linkWidth={(link) => {
                const sourceId =
                  typeof link.source === "object"
                    ? link.source.id
                    : link.source;
                const targetId =
                  typeof link.target === "object"
                    ? link.target.id
                    : link.target;
                const isHoveredLink =
                  hoveredNode &&
                  (sourceId === hoveredNode.id || targetId === hoveredNode.id);
                return isHoveredLink ? 2 : 1;
              }}
              onNodeHover={handleNodeHover}
              backgroundColor="transparent"
              height={isFullscreen ? "100vh" : 550}
              d3Force="charge"
              d3ForceStrength={-8000}
              d3VelocityDecay={0.3}
              d3AlphaDecay={0.01}
              d3ForceInit={(forceGraph) => {
                // Add collision force based on node size, with more padding
                forceGraph.d3Force(
                  "collide",
                  d3.forceCollide().radius((node) => node.size / 2 + 800)
                );
              }}
            />
          </div>
        </div>
        {/* Color legend for review score (now always below the interactive area) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
            marginBottom: 16,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 600,
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 120,
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  textAlign: "center",
                  letterSpacing: 0.2,
                  marginBottom: 2,
                }}
              >
                Lower Avg. Review
                <br />
                Score
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                30%
              </span>
            </div>
            <div
              style={{
                background:
                  "linear-gradient(to right, #d7191c, #fdae61, #ffffbf, #a6d96a, #1a9641)",
                width: 260,
                height: 22,
                borderRadius: 12,
                margin: "0 32px",
                border: "2px solid #222",
                boxShadow: "0 2px 12px 0 #0006",
                display: "flex",
                alignItems: "center",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 120,
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  textAlign: "center",
                  letterSpacing: 0.2,
                  marginBottom: 2,
                }}
              >
                Higher Avg. Review
                <br />
                Score
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                95%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperUniverse;
