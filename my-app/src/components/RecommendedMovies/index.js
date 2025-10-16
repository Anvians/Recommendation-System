import React, { useState, useEffect } from "react";
import "./index.css";

const RecommendedMovies = ({ recMovies }) => {
  const [moreMovies, setMoreMovies] = useState([]); // Movies fetched from backend
  const [error, setError] = useState(null); // Error message
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      if (!recMovies || recMovies.length === 0) return; // Prevent fetching if no recommendations

      setLoading(true); // Start loading
      setError(null); // Clear previous errors

      try {
        // Join the movie titles into a comma-separated string if `recMovies` is an array
        const query = Array.isArray(recMovies)
          ? recMovies.join(",")
          : recMovies;

        const response = await fetch(
          `http://localhost:5000/api/recmovies/?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();
        console.log(data);

        if (response.ok) {
          if (data && data.length > 0) {
            console.log(data);
            setMoreMovies(data); // Set fetched movies
          } else {
            setError("No movies found");
          }
        } else {
          setError(data.error || "Something went wrong");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch movies");
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchRecommendedMovies();
  }, [recMovies]); // Re-run when `recMovies` changes

  return (
    <div className="">
      {moreMovies.length !==0 && <h1>You might be interested in</h1>}
      {loading && <p>Loading...</p>} {/* Show loading spinner */}
      {error && <p className="error-text">{error}</p>} {/* Show errors */}
      {!loading && !error && (
        <ul className="movie-container">
          {moreMovies.map((movie, index) => (
            <li key={index} className="recommendation-item">
              <div key={movie.id} className="movie-card">
                <img
                  src={
                    movie.poster ||
                    "https://via.placeholder.com/200x300?text=No+Image"
                  }
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecommendedMovies;
