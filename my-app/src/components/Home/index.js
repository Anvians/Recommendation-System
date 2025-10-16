import React, { useState } from "react";
import "./index.css";

import Genres from "../Genres";
import RecommendedMovies from "../RecommendedMovies";
import Footer from "../Footer";

const Home = () => {
  const [isSearch, setIsSearch] = useState(true);
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recMovies, setRecMovies] = useState([]);
  const [recError, setRecError] = useState(null);

  const handleSearch = async () => {
    if (!search.trim()) {
      alert("Please enter a search term");
      return;
    }
    setMovies([]);  // Clear previous search results
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/search?q=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      if (response.ok) {
        if (data.length > 0) {
          setMovies(data);
          setSearch("");  // Clear search input
          handleRecommendation();
          setIsSearch(true);  // Mark as search-based results
        } else {
          setError("No movies found");
        }
      } else {
        setError("Something went wrong");
      }
    } catch (err) {
      setError("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendation = async () => {
    if (!search.trim()) {
      alert("Please enter a movie name");
      return;
    }
    setRecMovies([]);
    setRecError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/recommend?movie=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      if (response.ok) {
        setRecMovies(data.recommendations || []);
      } else {
        setRecError(data.error || "Something went wrong");
      }
    } catch (err) {
      setRecError("Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="search-section">
        <h1 className="name-app">Recommendation System</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <input
            type="text"
            placeholder="Search for a movie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      <Genres 
        isSearch={isSearch} 
        setIsSearch={setIsSearch} 
        setMovies={setMovies} 
      />

      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}
      <div className="movie-container">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <img
              src={movie.poster || "https://via.placeholder.com/200x300?text=No+Image"}
              alt={movie.title}
              className="movie-poster"
            />
            <h3 className="movie-title">{movie.title}</h3>
            {movie.overview && (
              <p className="movie-overview">
                {movie.overview.length > 100
                  ? `${movie.overview.substring(0, 100)}...`
                  : movie.overview}
              </p>
            )}
          </div>
        ))}
        {!loading && movies.length === 0 && !error }
      </div>

      <RecommendedMovies
        search={search}
        recMovies={recMovies}
        recError={recError}
      />

      <Footer/>
    </div>
  );
};

export default Home;
