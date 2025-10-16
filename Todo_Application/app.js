const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'todoApplication.db')

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
    console.log('DB Error: ${e.message}')
    process.exit(1)
  }
}

initializingDBAndServer()
// 1
app.get('/todos/', async (request, response) => {
  const {priority, status, search_q} = request.query
  let getTodoQuery = ''
  let queryParams = []

  if (priority !== undefined && status !== undefined) {
    getTodoQuery = `SELECT * FROM todo WHERE priority = ? AND status = ?;`
    queryParams = [priority, status]
  } else if (priority !== undefined) {
    getTodoQuery = `SELECT * FROM todo WHERE priority = ?;`
    queryParams = [priority]
  } else if (status !== undefined) {
    getTodoQuery = `SELECT * FROM todo WHERE status = ?;`
    queryParams = [status]
  } else if (search_q !== undefined) {
    getTodoQuery = `SELECT * FROM todo WHERE todo LIKE ?;`
    queryParams = [`%${search_q}%`]
  }
  response.send(await db.all(getTodoQuery, queryParams))
})

// 5
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getWitIdQuery = `
  SELECT * FROM todo WHERE id = ?;`
  const getWitId = await db.get(getWitIdQuery, [todoId])
  response.send(getWitId)
})
// 6
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const insertNewTodoQuery = `
  INSERT INTO todo(id, todo, priority, status) VALUES (?, ?, ?, ?);`
  await db.run(insertNewTodoQuery, [id, todo, priority, status])
  response.send('Todo Successfully Added')
})
// 7
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestQuery = request.body

  const updateWithIdPriorityStatusTodo = async requestQuery => {
    if (requestQuery.priority !== undefined) {
      let query = `UPDATE todo SET priority = ? WHERE id = ?;`
      await db.run(query, [requestQuery.priority, todoId])
      response.send('Priority Updated')
    } else if (requestQuery.status !== undefined) {
      let query = `UPDATE todo SET status = ? WHERE id = ?;`
      await db.run(query, [requestQuery.status, todoId])
      response.send('Status Updated')
    } else if (requestQuery.todo !== undefined) {
      let query = `UPDATE todo SET todo  = ? WHERE id = ?;`
      await db.run(query, [requestQuery.todo, todoId])
      response.send('Todo Updated')
    }
  }

  await updateWithIdPriorityStatusTodo(requestQuery)
})
// 8
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteATodoQuery = `
  DELETE FROM todo WHERE id = ?;`
  await db.run(deleteATodoQuery, [todoId])
  response.send('Todo Deleted')
})

module.exports = app
