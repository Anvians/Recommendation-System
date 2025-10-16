// server.js

// Import required modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Import CORS middleware
const axios = require('axios');
const movies = require('./movies.json'); // Import movies data
const { spawn } = require('child_process');
require('dotenv').config();

// Initialize the Express app
const app = express();

// Set up CORS to allow requests from the frontend
app.use(cors());

// Define the port the server will run on
const port = 5000;  // You can change this port as needed

// Serve the movies data from a JSON file
app.get('/api/movies', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  
  try {
    const filePath = path.join(__dirname, 'movies.json');
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: 'movies.json file not found' });
    }
    const moviesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const paginatedMovies = moviesData.slice((page - 1) * limit, page * limit);

    const enrichedMovies = await Promise.all(
      paginatedMovies.map(async (movie) => {
        try {
          const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movie.movie_id}`,{
              params:{
                api_key: process.env.TMDB_API_KEY, 
              }
            }
          );
          const posterPath = tmdbResponse.data.poster_path
            ? `https://image.tmdb.org/t/p/w500${tmdbResponse.data.poster_path}`
            : null;
          return { ...movie, poster: posterPath };
        } catch (error) {
          console.error(`TMDB API error for movie ${movie.movie_id}:`, error.message);
          return { ...movie, poster: null };
        }
      })
    );

    res.json({
      movies: enrichedMovies,
      totalPages: Math.ceil(moviesData.length / limit),
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movie data' });
  }
});



//Movie search in Search input


app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const lowerCaseQuery = query.toLowerCase();

  // Filter movies based on the query
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(lowerCaseQuery)
  );

  if (filteredMovies.length === 0) {
    return res.json({ message: 'No movies found' });
  }

  try {
    // Map through filteredMovies and fetch posters from TMDB
    const moviesWithPosters = await Promise.all(
      filteredMovies.map(async (movie) => {
        try {
          const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/search/movie`,
            {
              params: {
                api_key: process.env.TMDB_API_KEY, // Replace with your TMDB API key
                query: movie.title,
              },
            }
          );
          
            
          const posterPath =
            tmdbResponse.data.results.length > 0
              ? `https://image.tmdb.org/t/p/w500${tmdbResponse.data.results[0].poster_path}`
              : null;

          return { ...movie, poster: posterPath };
        } catch (error) {
          console.error(`Failed to fetch poster for movie: ${movie.title}`, error.message);
          return { ...movie, poster: null }; // Fallback to null if TMDB request fails
        }
      })
    );

    // Respond with the enriched movies
    res.json(moviesWithPosters);
  } catch (error) {
    console.error('Error fetching posters:', error.message);
    res.status(500).json({ error: 'Failed to fetch posters' });
  }
});

app.get('/api/genres', async (req, res) => {
  let { page = 1, limit = 25 } = req.query;

  // Convert page and limit to integers and handle invalid inputs
  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1; // Default to 1 if invalid
  if (isNaN(limit) || limit < 1) limit = 25; // Default to 50 if invalid

  const genre = req.query.q.toLowerCase();
  
  const filteredMovies = movies.filter((movie) => {
    const genres = JSON.parse(movie.genres); 
    return genres.some((g) => g.name.toLowerCase() === genre);
  });

  if (filteredMovies.length === 0) {
    return res.json({ message: 'No movies found' });
  }

  const paginatedMovies = filteredMovies.slice((page - 1) * limit, page * limit);

  try {
    const moviesWithPosters = await Promise.all(
      paginatedMovies.map(async (movie) => {
        try {
          const tmdbResponse = await axios.get('https://api.themoviedb.org/3/search/movie', {
            params: {
              api_key: process.env.TMDB_API_KEY, // Use environment variable for the API key
              query: movie.title,
              page: page,
            },
          });

          const posterPath =
            tmdbResponse.data.results.length > 0
              ? `https://image.tmdb.org/t/p/w500${tmdbResponse.data.results[0].poster_path}`
              : null;

          return { ...movie, poster: posterPath };
        } catch (error) {
          console.error(`Failed to fetch poster for movie: ${movie.title}`, error.message);
          return { ...movie, poster: null };
        }
      })
    );

    res.json(moviesWithPosters);
  } catch (error) {
    console.error('Error fetching posters:', error.message);
    res.status(500).json({ error: 'Failed to fetch posters' });
  }
});




//Machine Learning Model
app.get('/api/recommend', (req, res) => {
  const movie = req.query.movie;

  if (!movie) {
      return res.status(400).json({ error: 'Movie name is required' });
  }

  const path = require('path');

// Absolute path to the Python script
const scriptPath = path.join(
    __dirname, // Directory of the current script
    'model', // Folder containing the script
    'recommendation_script.py' // Python script name
);

const pythonProcess = spawn('python', [scriptPath, movie]);


  let data = '';
  let error = '';

  pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
  });

  pythonProcess.stderr.on('data', (chunk) => {
      error += chunk.toString();
  });

  pythonProcess.on('close', (code) => {
      if (code !== 0 || error) {
          console.error(`Python error: ${error}`);
          return res.status(500).json({
              error: 'Error while generating recommendations',
              details: error,
          });
      }

      const recommendations = data.trim().split('\n');
      res.json({ recommendations });
  });
});

//Fetching Recommended movies data



app.get('/api/recmovies', async (req, res) => {
  try {
    const moviesQuery = req.query.q;
   

    // Create a new variable for the modified string
    let modifiedQuery = moviesQuery.replace(/'/g, '"');

    // Now parse it as a JSON array
    let movieArray = JSON.parse(modifiedQuery);

    const movi = movieArray.map(title => ({ title }));
  

    if (!moviesQuery) {
      return res.status(400).json({ error: 'No movie titles provided' });
    }

    // Filter the movies once based on the movie titles in movi
    const filteredMovies = movies.filter((movie) =>
      movi.some((movieObj) => movieObj.title.toLowerCase() === movie.title.toLowerCase())
    );


    if (filteredMovies.length === 0) {
      return res.json({ error: 'No movies found' });
    }


    // Fetch poster details for the filtered movies
    const moviesWithPosters = await Promise.all(
      filteredMovies.map(async (movie) => {
        try {
          const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/search/movie`,
            {
              params: {
                api_key: process.env.TMDB_API_KEY,
                query: movie.title,
              },
            }
          );

          const posterPath =
            tmdbResponse.data.results.length > 0
              ? `https://image.tmdb.org/t/p/w500${tmdbResponse.data.results[0].poster_path}`
              : null;

          return { ...movie, poster: posterPath };
        } catch (error) {
          console.error(`Failed to fetch poster for movie: ${movie.title}`, error.message);
          return { ...movie, poster: null };
        }
      })
    );

    res.json(moviesWithPosters);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
