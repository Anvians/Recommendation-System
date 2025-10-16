const movieTitles = [
    'Thor: The Dark World',
    'Avengers: Age of Ultron',
    'Iron Man 3',
    'Captain America: The First Avenger',
    'Man of Steel',
    'Captain America: Civil War',
    'Batman v Superman: Dawn of Justice',
    'Ant-Man',
    'Iron Man 2',
    'Jupiter Ascending'
  ];
  
  // Convert each title to an object with key 'title'
  const movies = movieTitles.map(title => ({ title }));
  
  console.log(movies);
  