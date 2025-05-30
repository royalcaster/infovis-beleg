import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { colors, hexToRgba } from "../colors";
import { formatPercentage } from "../utils";

const formatYAxisTick = (tickValue) => {
  if (tickValue === 0) {
    return '';
  }
  return formatPercentage(tickValue);
};

const PositiveReviewsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <section className="chart-section">
        <h2>H1: Avg. Positive Review % Over Time</h2>
        <p>No data available for this hypothesis.</p>
      </section>
    );
  }

  return (
    <section className="chart-section">
      <h1 className="chart-title">Positive reviews over time</h1>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="6 6" stroke={colors.background3} />
          <XAxis
            dataKey="release_year"
            name="Release Year"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14, dy: 10 }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={formatYAxisTick}
            allowDecimals={false}
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14, dx: -10}}
          />
          <Tooltip
            formatter={(value) => formatPercentage(value)}
            contentStyle={{
              backgroundColor: hexToRgba(colors.blue, 0.1),
              borderColor: 'rgba(60, 60, 60, 0)',
              borderRadius: '5px',
              color: colors.font2,
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)"
            }}
            labelStyle={{ color: colors.font2, fontWeight: 'bold', margin: "5px" }}
            itemStyle={{ color: colors.font2 }}
          />
          <Legend
            verticalAlign="top"
            wrapperStyle={{paddingBottom: '20px' }}
            formatter={(value, entry, index) => <span style={{ color: colors.blue }}>{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="avg_positive_percentage"
            stroke={colors.blue}
            strokeWidth={3}
            activeDot={{ r: 8, fill: colors.blue, stroke: colors.font2, strokeWidth: 2 }}
            name="Average positive review percentage "
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default PositiveReviewsChart;
