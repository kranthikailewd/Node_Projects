const express = require('express')
const app = express()

app.get('/', (request, response) => {
  let date = new Date()
  let adjustedDate = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}`
  response.send(adjustedDate)
})

module.exports = app
