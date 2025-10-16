const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

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

// 1
app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `
    SELECT player_id AS playerId, player_name AS playerName FROM player_details;`
  const getAllPlayers = await db.all(getAllPlayersQuery)
  response.send(getAllPlayers)
})
// 2
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getAPlayerQuery = `
    SELECT player_id AS playerId, player_name AS playerName FROM player_details WHERE player_id = ?`
  const getAPlayer = await db.get(getAPlayerQuery, [playerId])
  response.send(getAPlayer)
})
// 3
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const toBeUpdatedPlayerQuery = `
    UPDATE player_details SET player_name = ? WHERE player_id = ?`
  const updatedPlayer = await db.run(toBeUpdatedPlayerQuery, [
    playerName,
    playerId,
  ])
  response.send('Player Details Updated')
})
// 4
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getAMatchQuery = `
    SELECT match_id AS matchId, match, year FROM match_details WHERE matchId = ?`
  const getAMatch = await db.get(getAMatchQuery, [matchId])
  response.send(getAMatch)
})
// 5
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getMatchesOfAPlayerQuery = `
    SELECT match_id AS matchId, match, year FROM match_details NATURAL JOIN player_match_score WHERE player_id = ?`
  const getMatchesOfAPlayer = await db.all(getMatchesOfAPlayerQuery, [playerId])
  response.send(getMatchesOfAPlayer)
})
// 6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getPlayersOfAMatchQuery = `
    SELECT player_id AS playerId, player_name AS playerName FROM player_details NATURAL JOIN player_match_score WHERE match_id = ?`
  const getPlayersOfAMatch = await db.all(getPlayersOfAMatchQuery, [matchId])
  response.send(getPlayersOfAMatch)
})
// 7
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getAPlayerStatsQuery = `
    SELECT player_id AS playerId, player_name AS playerName, SUM(score) AS totalScore, SUM(fours) AS totalFours, SUM(sixes) AS totalSixes FROM player_details NATURAL JOIN player_match_score WHERE playerId = ?`
  const getMatchesOfAPlayer = await db.get(getAPlayerStatsQuery, [playerId])
  response.send(getMatchesOfAPlayer)
})

module.exports = app
