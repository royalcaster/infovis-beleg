import * as d3 from "d3-scale-chromatic";

export const colors = {
  background1: "#0f111e",
  background2: "#1a1c2e",
  background3: "#24273a",
  font1: "#ffffff",
  font2: "#e0e0e0",
  accent1: "#5772ef",
  accent2: "#344bb0",
  accent3: "#82ca9d",
  accent4: "#8884d8",
  accent5: "#ffc658",
  accent6: "#ff8042",
  accent7: "#0088fe",
  accent8: "#00c49f",
  accent9: "#ffbb28",
  accent10: "#a4de6c",
  accent11: "#d0ed57",
};

export const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Centralized review color scale (red-yellow-green)
export function getReviewColor(percent) {
  // Clamp percent to [30, 95]
  const p = Math.max(30, Math.min(95, percent));
  // Normalize to [0, 1] for d3.interpolateRdYlGn
  const t = (p - 30) / (95 - 30);
  return d3.interpolateRdYlGn(t);
}
