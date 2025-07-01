import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartHeading from "./ChartHeading";

const Q4ReleaseImpactChart = ({ data, align = "left" }) => {
  // Step C1: Validate data shape
  const isValid =
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].release_period !== undefined &&
    data[0].avg_estimated_owners !== undefined;

  // Step C2: Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("[Q4ReleaseImpactChart] data sample:", data?.slice(0, 5));
  }

  // Always call hooks in the same order
  const safeData = isValid ? data : [];

  // Memoize the processed data to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    if (!safeData.length) return [];
    return safeData.map((item) => ({
      period: item.release_period,
      avg_owners: item.avg_estimated_owners,
      avg_reviews: item.avg_num_reviews,
      num_games: item.num_games,
    }));
  }, [safeData]);

  // Step C3: Handle empty or malformed data
  if (!isValid) {
    return <div>No valid data available for Q4 Release Impact.</div>;
  }

  if (!data?.length) {
    return <div>No data available</div>;
  }

  return (
    <div style={{ width: "100%", height: 400 }}>
      <div className={`chart-heading-block ${align}`}>
        <ChartHeading align={align}>
          Impact of Q4 Release on Game Success
        </ChartHeading>
        <p
          style={{
            color: "#ccc",
            fontSize: "1.08rem",
            maxWidth: 700,
            margin: "0 0 24px 0",
          }}
        >
          <i>Does releasing games in Q4 (the last quarter of the year) significantly impact their estimated owner counts and review numbers compared to other release periods?</i><br/><br/>
          This chart explores whether releasing a game in the fourth quarter
          (Q4) of the year affects its success. It compares average owners,
          average reviews, and the number of games released in each period,
          helping you spot if Q4 releases tend to perform better or worse than
          those in other quarters.
        </p>
      </div>
      <ResponsiveContainer>
        <BarChart
          data={processedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip
            formatter={(value, name) => {
              if (name === "avg_reviews") {
                return [value.toFixed(1), "Average Reviews"];
              }
              if (name === "avg_owners") {
                return [value.toLocaleString(), "Average Owners"];
              }
              return [value.toLocaleString(), "Number of Games"];
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="avg_owners"
            name="Average Owners"
            fill="#8884d8"
          />
          <Bar
            yAxisId="right"
            dataKey="avg_reviews"
            name="Average Reviews"
            fill="#82ca9d"
          />
          <Bar
            yAxisId="right"
            dataKey="num_games"
            name="Number of Games"
            fill="#ffc658"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(Q4ReleaseImpactChart);
