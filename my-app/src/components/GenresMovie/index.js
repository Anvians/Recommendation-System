import React, { useState, useEffect } from "react";

const GenresMovie = ({ genre }) => {
  const [movieList, setMovieList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (genre) {
      fetchMovies();
    }
  }, [genre, currentPage]);

  const fetchMovies = async () => {
    setLoading(true);

    try {
      const limit = 50; // Number of movies per page
      const response = await fetch(
        `http://localhost:5000/api/genres?q=${encodeURIComponent(
          genre
        )}&page=${currentPage}&limit=${limit}`
      );
      const data = await response.json();
      console.log("genres", data);

      if (response.ok) {
        setMovieList(data);
        setTotalPages(Math.ceil(data.totalCount / limit)); // Update total pages based on data length
      } else {
        console.error(data.error || "Failed to fetch movies");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <div className="movie-container">
        {loading && <p>Loading...</p>}
        {!loading && movieList.length === 0 && <p>No movies found.</p>}
        {!loading &&
          movieList.map((movie) => (
            <div key={movie.id} className="movie-card">
              <img
                src={movie.poster}
                alt={movie.title}
                className="movie-poster"
              />
              <h3>{movie.title}</h3>
              {movie.overview && (
                <p className="movie-overview">
                  {movie.overview.length > 100
                    ? `${movie.overview.substring(0, 100)}...`
                    : movie.overview}
                </p>
              )}
            </div>
          ))}
      </div>

      <div className="pagination-controls">
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {currentPage === totalPages ? "No More Results" : "See More"}
        </button>
      </div>
    </div>
  );
};

export default GenresMovie;
