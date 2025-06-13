import React, { useState, useCallback, useMemo } from "react";
import { debounce } from "lodash";

const FilterPanel = ({ data, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    genres: [],
    priceRange: [0, 100],
    yearRange: [2000, 2024],
  });

  // Memoize the unique genres to prevent unnecessary recalculations
  const genres = useMemo(() => {
    if (!data?.h4Data?.length) return [];
    return [...new Set(data.h4Data.map((item) => item.genre))];
  }, [data]);

  // Create a debounced version of onFilterChange
  const debouncedFilterChange = useCallback(
    debounce((newFilters) => {
      onFilterChange(newFilters);
    }, 300),
    [onFilterChange]
  );

  const handleGenreChange = useCallback(
    (genre) => {
      const newGenres = filters.genres.includes(genre)
        ? filters.genres.filter((g) => g !== genre)
        : [...filters.genres, genre];
      const newFilters = { ...filters, genres: newGenres };
      setFilters(newFilters);
      debouncedFilterChange(newFilters);
    },
    [filters, debouncedFilterChange]
  );

  const handlePriceMinChange = useCallback(
    (event) => {
      const newMin = Math.min(
        Number(event.target.value),
        filters.priceRange[1]
      );
      const newFilters = {
        ...filters,
        priceRange: [newMin, filters.priceRange[1]],
      };
      setFilters(newFilters);
      debouncedFilterChange(newFilters);
    },
    [filters, debouncedFilterChange]
  );

  const handlePriceMaxChange = useCallback(
    (event) => {
      const newMax = Math.max(
        Number(event.target.value),
        filters.priceRange[0]
      );
      const newFilters = {
        ...filters,
        priceRange: [filters.priceRange[0], newMax],
      };
      setFilters(newFilters);
      debouncedFilterChange(newFilters);
    },
    [filters, debouncedFilterChange]
  );

  const handleYearMinChange = useCallback(
    (event) => {
      const newMin = Math.min(Number(event.target.value), filters.yearRange[1]);
      const newFilters = {
        ...filters,
        yearRange: [newMin, filters.yearRange[1]],
      };
      setFilters(newFilters);
      debouncedFilterChange(newFilters);
    },
    [filters, debouncedFilterChange]
  );

  const handleYearMaxChange = useCallback(
    (event) => {
      const newMax = Math.max(Number(event.target.value), filters.yearRange[0]);
      const newFilters = {
        ...filters,
        yearRange: [filters.yearRange[0], newMax],
      };
      setFilters(newFilters);
      debouncedFilterChange(newFilters);
    },
    [filters, debouncedFilterChange]
  );

  return (
    <div className="filter-panel">
      <button
        className="filter-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Hide Filters" : "Show Filters"}
      </button>
      <div className={`filter-content ${isOpen ? "open" : ""}`}>
        <div className="filter-section">
          <h3>Genres</h3>
          <div className="genre-buttons">
            {genres.map((genre) => (
              <button
                key={genre}
                className={`genre-button ${
                  filters.genres.includes(genre) ? "active" : ""
                }`}
                onClick={() => handleGenreChange(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>Price Range</h3>
          <div className="range-inputs">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={filters.priceRange[0]}
              onChange={handlePriceMinChange}
              className="range-slider"
            />
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={filters.priceRange[1]}
              onChange={handlePriceMaxChange}
              className="range-slider"
            />
          </div>
          <div className="range-labels">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>

        <div className="filter-section">
          <h3>Year Range</h3>
          <div className="range-inputs">
            <input
              type="range"
              min="2000"
              max="2024"
              step="1"
              value={filters.yearRange[0]}
              onChange={handleYearMinChange}
              className="range-slider"
            />
            <input
              type="range"
              min="2000"
              max="2024"
              step="1"
              value={filters.yearRange[1]}
              onChange={handleYearMaxChange}
              className="range-slider"
            />
          </div>
          <div className="range-labels">
            <span>{filters.yearRange[0]}</span>
            <span>{filters.yearRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FilterPanel);
