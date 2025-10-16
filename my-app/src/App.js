import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';  // Import Router components
import './App.css';
import Home from './components/Home';   // Default import for Home component
import Movie from './components/Movies'; // Default import for Movie component
import Genres from './components/Genres';
import GenresMovie from './components/GenresMovie';
import LatestMovies from './components/LatestMovies'
import './components/movieCare.css'; // Adjust the path as needed


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />    {/* Home route */}
        <Route path='/movie' element={<Movie />} />  {/* Movie route */}
        <Route path='/genres' element={<Genres/>}/>
        <Route path='/genre-movie' element={<GenresMovie/>}/>
        <Route path='/latest_movies'element={<LatestMovies/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
