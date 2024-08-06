import React from "react";
import "./Search.css";

const Search = ({ searchTerm, setSearchTerm, handleSearch }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search by username, location, or sublocation"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          handleSearch(e.target.value);
        }}
      />
      <button onClick={() => handleSearch(searchTerm)}>Search</button>
    </div>
  );
};

export default Search;
