import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label, // Label might not be explicitly used in all charts but good to have if needed
} from 'recharts';
import './App.css'; // Assuming you have some basic CSS

// Helper functions (place outside the App component)
const formatNumber = (num, precision = 1) => {
  if (num === null || num === undefined || num === 'N/A') return 'N/A';
  if (typeof num === 'string' && isNaN(parseFloat(num))) return num;

  const numericValue = parseFloat(num);
  if (isNaN(numericValue)) return 'N/A';

  if (precision === 0 && Number.isInteger(numericValue)) return numericValue.toString();


  if (Math.abs(numericValue) >= 1000000000) return (numericValue / 1000000000).toFixed(precision) + 'B';
  if (Math.abs(numericValue) >= 1000000) return (numericValue / 1000000).toFixed(precision) + 'M';
  if (Math.abs(numericValue) >= 1000) return (numericValue / 1000).toFixed(precision) + 'K';

  return typeof numericValue === 'number' ? numericValue.toFixed(Math.min(precision, 2)) : numericValue;
};

const formatPercentage = (num) => {
  if (num === null || num === undefined || num === 'N/A') return 'N/A';
  const numericValue = parseFloat(num);
  if (isNaN(numericValue)) return num;
  return typeof numericValue === 'number' ? numericValue.toFixed(1) + '%' : numericValue;
};


function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for general info and each hypothesis's data
  const [generalInfo, setGeneralInfo] = useState(null);
  const [h1Data, setH1Data] = useState(null);
  const [h2Data, setH2Data] = useState(null);
  const [h3ScatterData, setH3ScatterData] = useState(null);
  const [h3BinnedData, setH3BinnedData] = useState(null);
  const [h4Data, setH4Data] = useState(null);
  const [h5Data, setH5Data] = useState(null);
  const [h6Data, setH6Data] = useState(null);
  const [h7Data, setH7Data] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchJson = async (fileName) => {
          const response = await fetch(`/processed_data/${fileName}.json`);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch ${fileName}: ${response.status} ${response.statusText}`
            );
          }
          return response.json();
        };

        const [
          genInfo,
          h1,
          h2,
          h3s,
          h3b,
          h4,
          h5,
          h6,
          h7,
        ] = await Promise.all([
          fetchJson('general_info'),
          fetchJson('h1_review_percentage_over_time'),
          fetchJson('h2_platforms_vs_owners'),
          fetchJson('h3_reviews_owners_scatter'),
          fetchJson('h3_reviews_owners_binned'),
          fetchJson('h4_genre_price_dominance'),
          fetchJson('h5_free_vs_paid'),
          fetchJson('h6_q4_release_impact'),
          fetchJson('h7_median_review_vs_price'),
        ]);

        setGeneralInfo(genInfo);
        setH1Data(h1);
        setH2Data(h2);
        setH3ScatterData(h3s);
        setH3BinnedData(h3b);
        setH4Data(h4);
        setH5Data(h5);
        setH6Data(h6);
        setH7Data(h7);

      } catch (err) {
        console.error("Failed to fetch processed data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on component mount

  if (loading) {
    return <div className="App-container"><h1>Loading Data...</h1></div>;
  }

  if (error) {
    return <div className="App-container error-message"><h1>Error Loading Data: {error}</h1></div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Steam Data Analysis Dashboard</h1>
      </header>
      <main className="App-container">

        {/* General Info Section */}
        {generalInfo && !generalInfo.error && (
          <section className="info-section">
            <h2>General Dataset Information</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <strong>Total Games Analyzed:</strong>
                <span>{formatNumber(generalInfo.total_games_analyzed, 0)}</span>
              </div>
              {generalInfo.free_vs_paid_counts?.map(item => (
                <div className="stat-item" key={item.type}>
                  <strong>{item.type} Games:</strong>
                  <span>{formatNumber(item.count, 0)}</span>
                </div>
              ))}
            </div>
            <h3>Numeric Column Statistics:</h3>
            {generalInfo.numeric_column_stats && generalInfo.numeric_column_stats.length > 0 ? (
              <div className="stats-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Min</th>
                      <th>Max</th>
                      <th>Average</th>
                      <th>Median</th>
                      <th>Std. Dev.</th>
                      <th>Non-Null Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalInfo.numeric_column_stats.map(stat => (
                      <tr key={stat.column_name}>
                        <td><strong>{stat.column_name}</strong></td>
                        <td>{stat.column_name.toLowerCase().includes('score') || stat.column_name.toLowerCase().includes('percentage') ? formatPercentage(stat.min) : formatNumber(stat.min)}</td>
                        <td>{stat.column_name.toLowerCase().includes('score') || stat.column_name.toLowerCase().includes('percentage') ? formatPercentage(stat.max) : formatNumber(stat.max)}</td>
                        <td>{stat.column_name.toLowerCase().includes('score') || stat.column_name.toLowerCase().includes('percentage') ? formatPercentage(stat.average) : formatNumber(stat.average)}</td>
                        <td>{stat.column_name.toLowerCase().includes('score') || stat.column_name.toLowerCase().includes('percentage') ? formatPercentage(stat.median) : formatNumber(stat.median)}</td>
                        <td>{stat.column_name.toLowerCase().includes('score') || stat.column_name.toLowerCase().includes('percentage') ? formatPercentage(stat.std_dev) : formatNumber(stat.std_dev)}</td>
                        <td>{formatNumber(stat.count_non_null, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No numeric column statistics available or an error occurred generating them.</p>
            )}
          </section>
        )}
        {generalInfo && generalInfo.error && (
            <section className="info-section error-message">
                <h2>General Dataset Information</h2>
                <p>Error loading general statistics: {generalInfo.error}</p>
            </section>
        )}


        {/* Hypothesis 1: Avg Positive Review % Over Time */}
        {h1Data && h1Data.length > 0 && (
          <section className="chart-section">
            <h2>H1: Avg. Positive Review % Over Time</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={h1Data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="release_year" name="Release Year">
                  <Label value="Release Year" offset={-15} position="insideBottom" />
                </XAxis>
                <YAxis
                  label={{ value: 'Avg. Positive Review %', angle: -90, position: 'insideLeft' }}
                  domain={[dataMin => (Math.floor(dataMin / 5) * 5), dataMax => (Math.ceil(dataMax / 5) * 5)]}
                  tickFormatter={formatPercentage}
                />
                <Tooltip formatter={(value) => formatPercentage(value)} />
                <Legend verticalAlign="top" />
                <Line type="monotone" dataKey="avg_positive_percentage" stroke="#8884d8" activeDot={{ r: 8 }} name="Avg. Positive %" />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Hypothesis 2: Platforms vs. Estimated Owners */}
        {h2Data && h2Data.length > 0 && (
          <section className="chart-section">
            <h2>H2: Avg. Estimated Owners by Number of Platforms</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={h2Data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="num_platforms" name="Number of Platforms">
                   <Label value="Number of Platforms" offset={-15} position="insideBottom" />
                </XAxis>
                <YAxis
                  label={{ value: 'Avg. Estimated Owners', angle: -90, position: 'insideLeft' }}
                  tickFormatter={formatNumber}
                />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend verticalAlign="top" />
                <Bar dataKey="avg_estimated_owners" fill="#82ca9d" name="Avg. Owners" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Hypothesis 3: Positive Reviews vs. Owners (Scatter) */}
        {h3ScatterData && h3ScatterData.length > 0 && (
          <section className="chart-section">
            <h2>H3: Positive Reviews vs. Estimated Owners (Scatter Plot - Sampled)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis
                  type="number" dataKey="positive" name="Positive Reviews"
                  tickFormatter={(tick) => formatNumber(tick,0)}
                  label={{ value: 'Positive Reviews', position: 'insideBottom', offset: -10 }}
                />
                <YAxis
                  type="number" dataKey="estimated_owners_lower" name="Est. Owners"
                  tickFormatter={(tick) => formatNumber(tick,0)}
                  label={{ value: 'Est. Owners (Lower)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value) => formatNumber(value,0)} />
                <Legend verticalAlign="top" />
                <Scatter name="Games (Sample)" data={h3ScatterData} fill="#dd84d8" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Hypothesis 3: Positive Reviews vs. Owners (Binned) */}
        {h3BinnedData && h3BinnedData.length > 0 && (
          <section className="chart-section">
            <h2>H3: Avg. Estimated Owners by Positive Review Bins</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={h3BinnedData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="positive_reviews_bin" name="Positive Review Count Bin">
                  <Label value="Positive Review Count Bin" offset={-15} position="insideBottom" />
                </XAxis>
                <YAxis
                  label={{ value: 'Avg. Est. Owners', angle: -90, position: 'insideLeft' }}
                  tickFormatter={formatNumber}
                />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend verticalAlign="top" />
                <Bar dataKey="avg_estimated_owners" fill="#ffc658" name="Avg. Owners" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Hypothesis 4: Genre Dominance by Price Point */}
        {h4Data && h4Data.length > 0 && (
          <section className="chart-section">
            <h2>H4: Top 3 Genres by Price Point</h2>
            <ResponsiveContainer width="100%" height={600}> {/* Increased height for vertical bar */}
              <BarChart data={h4Data} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(tick) => formatNumber(tick,0)}>
                  <Label value="Game Count" offset={-15} position="insideBottom" />
                </XAxis>
                <YAxis dataKey="genre" type="category" width={100} interval={0} name="Genre" />
                <Tooltip formatter={(value) => formatNumber(value,0)} labelFormatter={(label, payload) => payload && payload.length ? `${payload[0].payload.genre} (${payload[0].payload.price_bin})` : label} />
                <Legend verticalAlign="top" />
                {/* Creating separate bars for each price_bin for a grouped effect is complex here.
                    This will show all bars, you might need to process h4Data further for true grouping by price_bin.
                    For now, coloring by price_bin. */}
                <Bar dataKey="game_count" name="Game Count" >
                  {h4Data.map((entry, index) => {
                    let color = '#8884d8'; // Default
                    if (entry.price_bin === 'Free') color = '#4caf50';
                    else if (entry.price_bin && entry.price_bin.includes('$0.01')) color = '#82ca9d';
                    else if (entry.price_bin && entry.price_bin.includes('$10')) color = '#ffc658';
                    else if (entry.price_bin && entry.price_bin.includes('$20')) color = '#ff8042';
                    else if (entry.price_bin && entry.price_bin.includes('$30')) color = '#ff7300';
                    else if (entry.price_bin && entry.price_bin.includes('$50+')) color = '#d0ed57';
                    return <Bar key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
             <details style={{ marginTop: '10px' }}>
                <summary>View Raw Data for H4 (Top Genres by Price Bin)</summary>
                <pre style={{ maxHeight: '200px', overflowY: 'auto', background: '#f0f0f0', padding: '10px', fontSize: '0.8em' }}>
                    {JSON.stringify(h4Data, null, 2)}
                </pre>
            </details>
          </section>
        )}

        {/* Hypothesis 5: Free vs. Paid Games */}
        {h5Data && h5Data.length > 0 && (
          <section className="chart-section">
            <h2>H5: Free-to-Play vs. Paid Games Comparison</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={h5Data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="game_type" name="Game Type">
                  <Label value="Game Type" offset={-15} position="insideBottom" />
                </XAxis>
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tickFormatter={formatNumber}
                  label={{ value: 'Avg. Est. Owners', angle: -90, position: 'insideLeft' }}/>
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d"
                  label={{ value: 'Avg. Positive Review %', angle: 90, position: 'insideRight' }}
                  domain={[0, 100]} tickFormatter={formatPercentage}/>
                <Tooltip formatter={(value, name) => name === "Avg. Est. Owners" ? formatNumber(value) : formatPercentage(value)} />
                <Legend verticalAlign="top" />
                <Bar yAxisId="left" dataKey="avg_estimated_owners" fill="#8884d8" name="Avg. Est. Owners" />
                <Bar yAxisId="right" dataKey="avg_positive_percentage" fill="#82ca9d" name="Avg. Positive Review %" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Hypothesis 6: Q4 Release Impact */}
        {h6Data && h6Data.length > 0 && (
          <section className="chart-section">
            <h2>H6: Q4 Release Impact vs. Other Quarters</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={h6Data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="release_period" name="Release Period">
                  <Label value="Release Period" offset={-15} position="insideBottom" />
                </XAxis>
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tickFormatter={formatNumber}
                  label={{ value: 'Avg. Est. Owners', angle: -90, position: 'insideLeft' }}/>
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={formatNumber}
                  label={{ value: 'Avg. Num. Reviews', angle: 90, position: 'insideRight' }}/>
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend verticalAlign="top" />
                <Bar yAxisId="left" dataKey="avg_estimated_owners" fill="#8884d8" name="Avg. Est. Owners" />
                <Bar yAxisId="right" dataKey="avg_num_reviews" fill="#82ca9d" name="Avg. Num. Reviews" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Hypothesis 7: Median Review Score vs. Price */}
        {h7Data && h7Data.length > 0 && (
          <section className="chart-section">
            <h2>H7: Median Positive Review % by Price Bin</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={h7Data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="price_bin" name="Price Bin">
                   <Label value="Price Bin" offset={-15} position="insideBottom" />
                </XAxis>
                <YAxis
                  label={{ value: 'Median Positive Review %', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]} tickFormatter={formatPercentage}
                />
                <Tooltip formatter={(value) => formatPercentage(value)} />
                <Legend verticalAlign="top" />
                <Bar dataKey="median_positive_percentage" fill="#ff7300" name="Median Positive %" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

      </main>
    </div>
  );
}

export default App;
