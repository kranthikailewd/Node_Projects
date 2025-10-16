const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'userData.db')

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
    console.log('DB Error: ${e.message}')
    process.exit(1)
  }
}

initializeDBAndServer()

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const getUserQuery = `
    SELECT * FROM user WHERE username = ?;`
  const getUser = await db.get(getUserQuery, [username])

  if (password.length < 5) {
    response.status(400)
    response.send('Password is too short')
  } else if (getUser === undefined) {
    const hashingPassword = await bcrypt.hash(password, 10)
    const registerUser = `
        INSERT INTO user (username, name, password, gender, location) VALUES (?, ?, ?, ?, ?);`
    await db.run(registerUser, [
      username,
      name,
      hashingPassword,
      gender,
      location,
    ])
    response.status(200)
    response.send('User created successfully')
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const getUserQuery = `
    SELECT * FROM user WHERE username = ?;`
  const getUser = await db.get(getUserQuery, [username])

  if (getUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const checkingPassword = await bcrypt.compare(password, getUser.password)
    if (!checkingPassword) {
      response.status(400)
      response.send('Invalid password')
    } else {
      response.status(200)
      response.send('Login success!')
    }
  }
})

app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const getUserQuery = `
    SELECT * FROM user WHERE username = ?;`
  const {password} = await db.get(getUserQuery, [username])
  const checkingPassword = await bcrypt.compare(oldPassword, password)

  if (!checkingPassword) {
    response.status(400)
    response.send('Invalid current password')
  } else if (newPassword.length < 5) {
    response.status(400)
    response.send('Password is too short')
  } else {
    const hashingPassword = await bcrypt.hash(newPassword, 10)
    const updatingPasswordQuery = `
        UPDATE user SET password = ? WHERE username = ?;`
    await db.run(updatingPasswordQuery, [hashingPassword, username])
    response.status(200)
    response.send('Password updated')
  }
})

module.exports = app
