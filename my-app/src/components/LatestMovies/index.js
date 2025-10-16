import React, { useState, useEffect } from 'react';

const LatestMovies = () => {
  const [latestMovies, setLatestMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLatestMovies = async () => {
      try {
        const response = await fetch(
           `https://api.themoviedb.org/3/movie/latest?api_key=812b9bdd199b0645d32c927415125798&page=1`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch the latest movies');
        }
        const data = await response.json();
        setLatestMovies([data]); // The latest movie is returned as an object
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestMovies();
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && latestMovies.length > 0 && (
        <div>
          <h2>Latest Movies</h2>
          <div className="movie-list">
            {latestMovies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="movie-poster"
                />
                <h3>{movie.title}</h3>
                <p>{movie.overview}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestMovies;
