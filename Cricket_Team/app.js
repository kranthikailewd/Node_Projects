const express = require('express')
const path = require('path')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'cricketTeam.db')

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log('DB error: ${e.message}')
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `
    SELECT player_id AS playerId, player_name AS playerName, jersey_number AS jerseyNumber, role FROM cricket_team;`

  const getAllPlayersArray = await db.all(getAllPlayersQuery)
  response.send(getAllPlayersArray)
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addNewPlayerQuery = `
    INSERT INTO cricket_team (player_name,jersey_number,role) VALUES ('${playerName}',${jerseyNumber},'${role}');`

  const addNewPlayer = await db.run(addNewPlayerQuery)
  const addNewPlayerId = addNewPlayer.lastID
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getSinglePlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId}`

  const singlePlayerData = await db.get(getSinglePlayerQuery)
  const getSinglePlayer = {
    playerId: singlePlayerData.player_id,
    playerName: singlePlayerData.player_name,
    jerseyNumber: singlePlayerData.jersey_number,
    role: singlePlayerData.role,
  }
  response.send(getSinglePlayer)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerUpdateBody = request.body
  const {playerName, jerseyNumber, role} = playerUpdateBody
  const updatePlayerQuery = `
    UPDATE cricket_team SET player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}' WHERE player_id = ${playerId}`

  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const removePlayerQuery = `
    DELETE FROM cricket_team WHERE player_id = ${playerId}`

  await db.run(removePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
