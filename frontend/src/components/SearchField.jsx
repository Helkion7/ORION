import React, { useState, useEffect } from "react";
import "../styles/search.css";

const SearchField = ({
  onSearch,
  initialValue = "",
  placeholder = "Search...",
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Update local state if initialValue changes (e.g., when filters are cleared)
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch(searchTerm);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="field-row search-form">
      <label htmlFor="search-field">Search:</label>
      <div className="search-input-container">
        <input
          id="search-field"
          type="text"
          value={searchTerm}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          aria-label="Search tickets"
          disabled={loading}
        />
        {searchTerm && (
          <button
            type="button"
            className="clear-search"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "..." : "Search"}
      </button>
    </form>
  );
};

export default SearchField;
