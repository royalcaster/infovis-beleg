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
import { colors, hexToRgba } from "../colors";

const GenrePriceDominanceChart = ({ data }) => {
  // Step C1: Validate data shape
  const isValid =
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].price_bin !== undefined &&
    data[0].genre !== undefined &&
    data[0].game_count !== undefined;

  // Step C2: Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("[GenrePriceDominanceChart] data sample:", data?.slice(0, 5));
  }

  // Always call hooks in the same order
  const safeData = isValid ? data : [];

  // Memoize the processed data to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    if (!safeData.length) return [];

    // Group data by price_bin and calculate genre percentages
    const priceBins = [...new Set(safeData.map((item) => item.price_bin))].sort(
      (a, b) => {
        if (a === "Free") return -1;
        if (b === "Free") return 1;
        if (a === "$50+") return 1;
        if (b === "$50+") return -1;
        return a.localeCompare(b);
      }
    );

    return priceBins.map((priceBin) => {
      const gamesInBin = safeData.filter((item) => item.price_bin === priceBin);
      const totalGames = gamesInBin.reduce(
        (sum, item) => sum + item.game_count,
        0
      );

      if (totalGames === 0) {
        return {
          priceRange: priceBin,
          totalGames: 0,
        };
      }

      // Calculate genre percentages
      const genrePercentages = gamesInBin.reduce((acc, item) => {
        acc[item.genre] = (item.game_count / totalGames) * 100;
        return acc;
      }, {});

      return {
        priceRange: priceBin,
        totalGames,
        ...genrePercentages,
      };
    });
  }, [safeData]);

  // Memoize the unique genres to prevent unnecessary recalculations
  const genres = useMemo(() => {
    if (!safeData.length) return [];
    return [...new Set(safeData.map((item) => item.genre))];
  }, [safeData]);

  // Memoize the color mapping to prevent unnecessary recalculations
  const genreColors = useMemo(() => {
    const colorArray = [
      colors.accent4,
      colors.accent3,
      colors.accent5,
      colors.accent6,
      colors.accent7,
      colors.accent8,
      colors.accent9,
      colors.accent10,
      colors.accent11,
    ];
    return genres.reduce((acc, genre, index) => {
      acc[genre] = colorArray[index % colorArray.length];
      return acc;
    }, {});
  }, [genres]);

  // Step C3: Handle empty or malformed data
  if (!isValid) {
    return <div>No valid data available for Genre Price Dominance.</div>;
  }

  if (!data?.length) {
    return <div>No data available</div>;
  }

  return (
    <section className="chart-section">
      <h1 className="chart-title">Top Genres by Price Range</h1>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={processedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.font2}
            opacity={0.2}
          />
          <XAxis
            dataKey="priceRange"
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
          />
          <YAxis
            stroke={colors.font2}
            tick={{ fill: colors.font2, fontSize: 14 }}
            label={{
              value: "Genre Percentage (%)",
              angle: -90,
              position: "insideLeft",
              fill: colors.font2,
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: hexToRgba(colors.background1, 0.9),
              border: "none",
              borderRadius: "4px",
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
            formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
            labelFormatter={(label) => `Price Range: ${label}`}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              color: colors.font2,
            }}
          />
          {genres.map((genre) => (
            <Bar
              key={genre}
              dataKey={genre}
              stackId="a"
              fill={genreColors[genre]}
              name={genre}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

export default React.memo(GenrePriceDominanceChart);
