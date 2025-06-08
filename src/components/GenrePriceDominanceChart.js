import React from "react";
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
import { colors, hexToRgba } from "../colors";

const GenrePriceDominanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <section className="chart-section">
        <h2>H4: Genre Dominance by Price Range</h2>
        <p>No data available for this analysis.</p>
      </section>
    );
  }

  // Transform data to group by price_bin
  const transformedData = data.reduce((acc, curr) => {
    const existingBin = acc.find((item) => item.price_bin === curr.price_bin);
    if (existingBin) {
      existingBin[curr.genre] = curr.game_count;
    } else {
      acc.push({
        price_bin: curr.price_bin,
        [curr.genre]: curr.game_count,
      });
    }
    return acc;
  }, []);

  // Get unique genres for legend
  const genres = [...new Set(data.map((item) => item.genre))];

  return (
    <section className="chart-section">
      <h1 className="chart-title">Top Genres by Price Range</h1>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={transformedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="6 6" stroke={colors.background3} />
          <XAxis
            dataKey="price_bin"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
          />
          <YAxis
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: hexToRgba(colors.background1, 0.5),
              borderColor: "rgba(60, 60, 60, 0)",
              borderRadius: "5px",
              color: colors.font2,
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
            }}
            labelStyle={{
              color: colors.font2,
              fontWeight: "bold",
              margin: "5px",
            }}
            itemStyle={{ color: colors.font2 }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              color: colors.font2,
            }}
          />
          {genres.map((genre, index) => (
            <Bar
              key={genre}
              dataKey={genre}
              stackId="a"
              fill={hexToRgba(colors.blue, 0.7 - index * 0.1)}
              name={genre}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

export default GenrePriceDominanceChart;
