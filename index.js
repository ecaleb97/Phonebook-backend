const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(cors())
app.disable('x-powered-by')
app.use(express.static('dist'))

const PORT = process.env.PORT || 3001

let persons = [
  { 
    id: 1,
    name: "Arto Hellas", 
    number: "040-123456"
  },
  { 
    id: 2,
    name: "Ada Lovelace", 
    number: "39-44-5323523"
  },
  { 
    id: 3,
    name: "Dan Abramov", 
    number: "12-43-234345"
  },
  { 
    id: 4,
    name: "Mary Poppendieck", 
    number: "39-23-6423122"
  }
]

/* function requestLogger(request, response, next) {
  console.log('Method:', request.method)
  console.log('Path:', request.path)
  console.log('Body:', request.body)
  console.log('---')
  next()
} */

morgan.token('body', (request, response) => JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


/* app.use(requestLogger)  */

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  const person = persons.find(person => person.id === id)

  if(person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.get('/info', (request, response) => {
  const date = new Date()

  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${date.toISOString().split('T')[0]}</p>
  `)
})

function generateId() {
  const ids = persons.map(person => person.id)
  const maxId = persons.length > 0 
    ? Math.max(...ids)
    : 0

  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  const person = request.body

  if(!person.name || !person.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }

  if(persons.find(p => p.name === person.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const newPerson = {
    id: generateId(),
    name: person.name,
    number: person.number
  }

  persons = [...persons, newPerson]

  /* console.log(persons) */

  response.json(newPerson)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

function unknownEndpoint(request, response) {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

