import React, { useEffect, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import ForceGraph2D from "react-force-graph-2d";
import ChartHeading from "./ChartHeading";

const DeveloperUniverse = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [showOrphanNodes, setShowOrphanNodes] = useState(true);
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

    // Create size and color scales
    const maxOwners = Math.max(
      ...filteredNodes.map((n) => n.total_owners || 1)
    );
    const minOwners = Math.min(
      ...filteredNodes.map((n) => n.total_owners || 1)
    );

    const sizeScale = d3
      .scaleLog()
      .domain([minOwners > 0 ? minOwners : 1, maxOwners])
      .range([5, 40]);

    // Domain for review scores is roughly 0-100%
    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain([30, 95]); // Use a more focused range for better color distinction

    const finalNodes = filteredNodes.map((node) => {
      // Node size based on total owners
      const size = sizeScale(node.total_owners || 1);
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
      <ChartHeading title="Developer Universe" />
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
        />
      </div>
    </div>
  );
};

export default DeveloperUniverse;
