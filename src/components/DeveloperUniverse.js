import React, { useEffect, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import ForceGraph2D from "react-force-graph-2d";
import ChartHeading from "./ChartHeading";

const DeveloperUniverse = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [showOrphanNodes, setShowOrphanNodes] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const graphRef = React.useRef();

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
    filteredNodes = filteredNodes.filter(node => (node.game_count || 0) > 5);

    // Create size and color scales
    const maxGames = Math.max(
      ...filteredNodes.map((n) => n.game_count || 1)
    );
    const minGames = Math.min(
      ...filteredNodes.map((n) => n.game_count || 1)
    );

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
        graphRef.current.zoomToFit(400);
      }, 100);
    }
  }, [loading, processedGraphData]);

  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node);
  }, []);

  const handleResetLayout = () => {
    if (graphRef.current) {
      graphRef.current.d3ReheatSimulation();
      graphRef.current.zoomToFit(400);
    }
  };

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
      <h1 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: 8, marginTop: 0 }}>Developer & Publisher Universe</h1>
      <p style={{ color: '#ccc', fontSize: '1.08rem', maxWidth: 700, margin: '0 0 24px 0' }}>
        This network graph visualizes the relationships between game developers and publishers on Steam. Each node represents a developer or publisher, with node size indicating the number of games they are associated with. The color of each node reflects the average review score of their games (from red for lower scores to green for higher scores). Connections (edges) between nodes indicate that the connected developers or publishers have collaborated on at least one game.
      </p>
      <button onClick={handleResetLayout} style={{ marginBottom: 10 }}>
        Reset Layout
      </button>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <ForceGraph2D
          ref={graphRef}
          graphData={processedGraphData}
          nodeLabel={(node) => `
            ${node.id}
            Type: ${node.type.charAt(0).toUpperCase() + node.type.slice(1)}
            Games: ${node.game_count}
            Avg. Positive Reviews: ${node.avg_review_score}%
            Total Players: ~${formatOwners(node.total_owners)}
          `}
          nodeVal="size"
          nodeColor={(node) => {
            if (
              hoveredNode &&
              hoveredNode.neighbors.some((n) => n.id === node.id)
            ) {
              return "rgba(255, 165, 0, 0.9)"; // Orange for neighbors
            }
            if (hoveredNode && node.id === hoveredNode.id) {
              return "rgba(255, 255, 0, 1)"; // Bright yellow for hovered node
            }
            return node.color;
          }}
          linkColor={(link) => {
            const sourceId =
              typeof link.source === "object" ? link.source.id : link.source;
            const targetId =
              typeof link.target === "object" ? link.target.id : link.target;
            const isHoveredLink =
              hoveredNode &&
              (sourceId === hoveredNode.id || targetId === hoveredNode.id);
            return isHoveredLink
              ? "rgba(255, 255, 0, 0.7)"
              : "rgba(255,255,255,0.2)";
          }}
          linkWidth={(link) => {
            const sourceId =
              typeof link.source === "object" ? link.source.id : link.source;
            const targetId =
              typeof link.target === "object" ? link.target.id : link.target;
            const isHoveredLink =
              hoveredNode &&
              (sourceId === hoveredNode.id || targetId === hoveredNode.id);
            return isHoveredLink ? 2 : 1;
          }}
          onNodeHover={handleNodeHover}
          backgroundColor="#0f111e"
          height={600}
          d3Force="charge"
          d3ForceStrength={-8000}
          d3VelocityDecay={0.3}
          d3AlphaDecay={0.01}
          d3ForceInit={(forceGraph) => {
            // Add collision force based on node size, with more padding
            forceGraph.d3Force('collide', d3.forceCollide().radius(node => node.size / 2 + 800));
          }}
        />
      </div>
      {/* Color legend for review score */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', width: 480 }}>
          <span style={{ color: '#fff', fontSize: 13, marginRight: 8, minWidth: 90 }}>
            Lower Avg. Review Score
          </span>
          <div style={{
            background: 'linear-gradient(to right, #d7191c, #fdae61, #ffffbf, #a6d96a, #1a9641)',
            width: 260,
            height: 16,
            borderRadius: 8,
            margin: '0 8px',
            border: '1px solid #444'
          }} />
          <span style={{ color: '#fff', fontSize: 13, marginLeft: 8, minWidth: 90, textAlign: 'right' }}>
            Higher Avg. Review Score
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: 320, marginTop: 2 }}>
          <span style={{ color: '#fff', fontSize: 12 }}>30%</span>
          <span style={{ color: '#fff', fontSize: 12 }}>95%</span>
        </div>
      </div>
    </div>
  );
};

export default DeveloperUniverse;
