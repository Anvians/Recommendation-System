import React, { useState, useEffect } from 'react';
import './index.css';

const Genres = ({ isSearch, setIsSearch, setMovies }) => {
  const [movieList, setMovieList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchGenres = async (genre) => {
    setMovies([]);  // Clear search results
    setIsSearch(false);  // Indicate it's a genre search now
    setMovieList([]);  // Clear genre-related movie list
    setLoading(true);

    try {
      const limit = 25; // Number of movies per page
      const response = await fetch(
        `http://localhost:5000/api/genres?q=${encodeURIComponent(genre)}&page=${currentPage}&limit=${limit}`
      );
      const data = await response.json();
      if (response.ok) {
        setMovieList(data);
        setTotalPages(Math.ceil(data.totalCount / limit));  // Update total pages
      } else {
        console.error(data.error || 'Failed to fetch movies');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSearch) {
      setMovieList([]); // Clear the movie list when search is active
    }
  }, [isSearch]);

  // const handlePageChange = (newPage) => {
  //   if (newPage > 0 && newPage <= totalPages) {
  //     setCurrentPage(newPage);
  //     searchGenres('Comedy'); // Replace with dynamic genre if needed
  //   }
  // };

  return (
    <div>
      <div className='genres-container'>
        <ul className='genres-list'>
          {['Comedy', 'Science Fiction','Drama','Documentary','Action','Animation','Music','Crime', 'Horror', 'Thriller', 'Romance', 'Fantasy', 'Adventure', 'Mystery', 'History'].map((genre) => (
            <li key={genre}>
              <button onClick={() => searchGenres(genre)}>{genre}</button>
            </li>
          ))}
        </ul>
      </div>
      <div className='movie-container'>
        {loading && <p>Loading...</p>}
        {!loading && movieList.length === 0 && !isSearch && <p>No movies found for this genre.</p>}
        {!loading && movieList.map((movie) => (
          <div key={movie.id} className='movie-card'>
            <img src={movie.poster} alt={movie.title} className="movie-poster" />
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
      </div>
    </div>
  );
};

export default Genres;
