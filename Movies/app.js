const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializingDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB error: ${e.message}`)
    process.exit(1)
  }
}

initializingDBAndServer()

app.get('/movies/', async (request, response) => {
  const getAllMoviesQuery = `
    SELECT movie_name FROM movie;`
  const getAllMovies = await db.all(getAllMoviesQuery)

  const formattedMovies = getAllMovies.map(movie => ({
    movieName: movie.movie_name,
  }))
  response.send(formattedMovies)
})

app.post('/movies/', async (request, response) => {
  const newMovie = request.body
  const {directorId, movieName, leadActor} = newMovie
  const postNewMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (?, ?, ?);`
  await db.run(postNewMovieQuery, [directorId, movieName, leadActor])
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getParticularMovieQuery = `
    SELECT * FROM movie WHERE movie_id = ?;`
  const getParticularMovie = await db.get(getParticularMovieQuery, [movieId])
  if (!getParticularMovie) {
    response.status(404).send('Movie not found')
  }
  const {movie_id, director_id, movie_name, lead_actor} = getParticularMovie
  const particularMovie = {
    movieId: movie_id,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  }
  response.send(particularMovie)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
    UPDATE movie SET director_id = ?, movie_name = ?, lead_actor = ? WHERE movie_id = ?;`
  const updatedMovie = await db.run(updateMovieQuery, [
    directorId,
    movieName,
    leadActor,
    movieId,
  ])
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getAllDirectorsQuery = `
    SELECT * FROM director;`
  const getAllDirectors = await db.all(getAllDirectorsQuery)
  const formattedDirectors = getAllDirectors.map(director => ({
    directorId: director.director_id,
    directorName: director.director_name,
  }))
  response.send(formattedDirectors)
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMoviesOfParticularDirectorQuery = `
    SELECT movie_name AS movieName FROM movie WHERE director_id = ?;`
  const getParticularDirectorMovies = await db.all(
    getMoviesOfParticularDirectorQuery,
    [directorId],
  )
  response.send(getParticularDirectorMovies)
})

module.exports = app
