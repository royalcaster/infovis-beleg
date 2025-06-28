import React from "react";

const ChartHeading = ({ children }) => (
  <h2
    style={{
      fontSize: "2rem",
      fontWeight: 800,
      color: "#fff",
      marginBottom: "1.2rem",
      marginTop: 0,
      letterSpacing: "-1px",
      textShadow: "0 2px 8px rgba(0,0,0,0.15)",
      textAlign: "left",
    }}
  >
    {children}
  </h2>
);

export default ChartHeading;
