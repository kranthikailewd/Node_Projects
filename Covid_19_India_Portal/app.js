const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'covid19IndiaPortal.db')

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

app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const getUserQuery = `
  SELECT * FROM user WHERE username = ?;`
  const getUser = await db.get(getUserQuery, [username])

  if (getUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const checkPassword = await bcrypt.compare(password, getUser.password)
    if (!checkPassword) {
      response.status(400)
      response.send('Invalid password')
    } else {
      const payload = {username}
      const jwtToken = jwt.sign(payload, 'SECRET_TOKEN')
      response.send({jwtToken})
    }
  }
})

const authenticateToken = (request, response, next) => {
  let jwtToken

  const authToken = request.headers['authorization']
  if (authToken !== undefined) {
    jwtToken = authToken.split(' ')[1]
  }

  if (jwtToken === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jwt.verify(jwtToken, 'SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        next()
      }
    })
  }
}

app.get('/states/', authenticateToken, async (request, response) => {
  const getAllStatesQuery = `
    SELECT state_id AS stateId, state_name AS stateName, population FROM state;`
  const getAllStates = await db.all(getAllStatesQuery)
  response.send(getAllStates)
})

app.get('/states/:stateId/', authenticateToken, async (request, response) => {
  const {stateId} = request.params
  const getAStateQuery = `
    SELECT state_id AS stateId, state_name AS stateName, population FROM state WHERE state_id = ?;`
  const getAState = await db.get(getAStateQuery, [stateId])
  response.send(getAState)
})

app.post('/districts/', authenticateToken, async (request, response) => {
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

app.get(
  '/districts/:districtId/',
  authenticateToken,
  async (request, response) => {
    const {districtId} = request.params
    const getADistrictQuery = `
    SELECT district_id AS districtId, district_name AS districtName, state_id AS stateId, cases, cured, active, deaths FROM district WHERE district_id = ?;`
    const getADistrict = await db.get(getADistrictQuery, [districtId])
    response.send(getADistrict)
  },
)

app.delete(
  '/districts/:districtId/',
  authenticateToken,
  async (request, response) => {
    const {districtId} = request.params
    const deleteADistrictQuery = `
    DELETE FROM district WHERE district_id = ?;`
    const getADistrict = await db.run(deleteADistrictQuery, [districtId])
    response.send('District Removed')
  },
)

app.put(
  '/districts/:districtId/',
  authenticateToken,
  async (request, response) => {
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
  },
)

app.get(
  '/states/:stateId/stats/',
  authenticateToken,
  async (request, response) => {
    const {stateId} = request.params
    const getAStateStatsQuery = `
    SELECT SUM(cases) AS totalCases, SUM(cured) AS totalCured, SUM(active) AS totalActive, SUM(deaths) AS totalDeaths FROM district WHERE state_id = ?;`
    const getAStateStats = await db.get(getAStateStatsQuery, [stateId])
    response.send(getAStateStats)
  },
)

module.exports = app
