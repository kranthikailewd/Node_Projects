const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'covid19India.db')

const initializingDBAndServer = async () => {
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

initializingDBAndServer()

app.get('/states/', async (request, response) => {
  const getAllStatesQuery = `
    SELECT state_id AS stateId, state_name AS stateName, population FROM state;`
  const getAllStates = await db.all(getAllStatesQuery)
  response.send(getAllStates)
})

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getAStateQuery = `
    SELECT state_id AS stateId, state_name AS stateName, population FROM state WHERE state_id = ?;`
  const getAState = await db.get(getAStateQuery, [stateId])
  response.send(getAState)
})

app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const postNewDistrictQuery = `
    INSERT INTO district (district_name, state_id, cases, cured, active, deaths) VALUES (?, ?, ?, ?, ?, ?)`
  const postnewDistrict = await db.run(postNewDistrictQuery, [
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  ])
  response.send('District Successfully Added')
})

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getADistrictQuery = `
    SELECT district_id AS districtId, district_name AS districtName, state_id AS stateId, cases, cured, active, deaths FROM district WHERE district_id = ?;`
  const getADistrict = await db.get(getADistrictQuery, [districtId])
  response.send(getADistrict)
})

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteADistrictQuery = `
    DELETE FROM district WHERE district_id = ?;`
  const getADistrict = await db.run(deleteADistrictQuery, [districtId])
  response.send('District Removed')
})

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const updateADistrictQuery = `
    UPDATE district SET district_name = ?, state_id = ?, cases = ?, cured = ?, active = ?, deaths = ? WHERE district_id = ?;`
  await db.run(updateADistrictQuery, [
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
    districtId,
  ])
  response.send('District Details Updated')
})

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getAStateStatsQuery = `
    SELECT SUM(cases) AS totalCases, SUM(cured) AS totalCured, SUM(active) AS totalActive, SUM(deaths) AS totalDeaths FROM district WHERE state_id = ?;`
  const getAStateStats = await db.get(getAStateStatsQuery, [stateId])
  response.send(getAStateStats)
})

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getStateByDistrictIDQuery = `
    SELECT state_name AS stateName FROM state NATURAL JOIN district WHERE district_id = ?;`
  const getStateByDistrictID = await db.get(getStateByDistrictIDQuery, [
    districtId,
  ])
  response.send(getStateByDistrictID)
})

module.exports = app
