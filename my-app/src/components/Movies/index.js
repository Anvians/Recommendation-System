import React, { useEffect, useState } from "react";
import "./index.css";

const Movie = () => {
  const [movies, setMovies] = useState([]); // Store fetched movies
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [loading, setLoading] = useState(false); // Loading state

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/movies?page=${page}&limit=50`
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("Fetched data:", data);

      if (Array.isArray(data.movies)) {
        setMovies((prevMovies) => [...prevMovies, ...data.movies]);
      } else {
        console.error("Error: Movies data is not iterable");
      }
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching movies:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page]);

  const loadMoreMovies = () => {
    if (page < totalPages) setPage((prevPage) => prevPage + 1);
  };

  return (
    <div>
      <h1>Recommendation System</h1>
      <div className="movie-container">
        {movies.length === 0 && !loading && <p>No movies to display.</p>}
        {movies.map((movie) => (
          <div className="movie-card" key={movie.id || movie.movie_id}>
            {movie.poster ? (
              <img
                src={movie.poster}
                alt={`${movie.title} Poster`}
                style={{ width: "200px", marginTop: "10px" }}
                className="image"
              />
            ) : (
              <p>No poster available</p>
            )}
            <strong className="movie-title">{movie.title}</strong>
            <p className="movie-overview">
              {movie.overview} {movie.overview}
            </p>
          </div>
        ))}
      </div>
      {loading && <p>Loading...</p>}
      {page < totalPages && !loading && (
        <button onClick={loadMoreMovies}>Load More</button>
      )}
    </div>
  );
};

export default Movie;
