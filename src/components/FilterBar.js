import React, { useState, useEffect, useCallback, useMemo } from "react";
import Select from "react-select";
import { colors } from "../colors";
import debounce from "lodash/debounce";

const FilterBar = React.memo(({ data, onFilterChange }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [yearRange, setYearRange] = useState([2000, 2024]);

  // Memoize genres extraction
  const genres = useMemo(() => {
    if (!data?.h4Data) return [];
    const uniqueGenres = [
      ...new Set(data.h4Data.map((item) => item.genre)),
    ].sort();
    return uniqueGenres.map((genre) => ({ value: genre, label: genre }));
  }, [data?.h4Data]);

  // Create a debounced version of onFilterChange
  const debouncedFilterChange = useMemo(
    () =>
      debounce((filters) => {
        onFilterChange(filters);
      }, 300),
    [onFilterChange]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFilterChange.cancel();
    };
  }, [debouncedFilterChange]);

  const handleGenreChange = useCallback(
    (selected) => {
      const newSelected = selected || [];
      setSelectedGenres(newSelected);
      debouncedFilterChange({
        genres: newSelected.map((option) => option.value),
        priceRange,
        yearRange,
      });
    },
    [debouncedFilterChange, priceRange, yearRange]
  );

  const handlePriceChange = useCallback(
    (event) => {
      const newRange = [parseInt(event.target.value), priceRange[1]];
      setPriceRange(newRange);
      debouncedFilterChange({
        genres: selectedGenres.map((option) => option.value),
        priceRange: newRange,
        yearRange,
      });
    },
    [debouncedFilterChange, selectedGenres, yearRange]
  );

  const handleYearChange = useCallback(
    (event) => {
      const newRange = [parseInt(event.target.value), yearRange[1]];
      setYearRange(newRange);
      debouncedFilterChange({
        genres: selectedGenres.map((option) => option.value),
        priceRange,
        yearRange: newRange,
      });
    },
    [debouncedFilterChange, selectedGenres, priceRange]
  );

  // Memoize styles
  const styles = useMemo(
    () => ({
      filterBarStyle: {
        backgroundColor: colors.background2,
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
      filterGroupStyle: {
        marginBottom: "15px",
      },
      labelStyle: {
        color: colors.text,
        marginBottom: "5px",
        display: "block",
      },
      selectStyle: {
        control: (base) => ({
          ...base,
          backgroundColor: colors.background1,
          borderColor: colors.border,
          "&:hover": {
            borderColor: colors.accent,
          },
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: colors.background1,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? colors.accent : colors.background1,
          color: colors.text,
          "&:hover": {
            backgroundColor: colors.accent,
          },
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: colors.accent,
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: colors.text,
        }),
      },
      sliderStyle: {
        width: "100%",
        marginTop: "10px",
      },
    }),
    []
  );

  return (
    <div style={styles.filterBarStyle}>
      <div style={styles.filterGroupStyle}>
        <label style={styles.labelStyle}>Genres</label>
        <Select
          isMulti
          options={genres}
          value={selectedGenres}
          onChange={handleGenreChange}
          styles={styles.selectStyle}
          placeholder="Select genres..."
          isSearchable={false}
        />
      </div>

      <div style={styles.filterGroupStyle}>
        <label style={styles.labelStyle}>
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={priceRange[0]}
          onChange={handlePriceChange}
          style={styles.sliderStyle}
        />
      </div>

      <div style={styles.filterGroupStyle}>
        <label style={styles.labelStyle}>
          Release Year: {yearRange[0]} - {yearRange[1]}
        </label>
        <input
          type="range"
          min="2000"
          max="2024"
          value={yearRange[0]}
          onChange={handleYearChange}
          style={styles.sliderStyle}
        />
      </div>
    </div>
  );
});

FilterBar.displayName = "FilterBar";

export default FilterBar;
