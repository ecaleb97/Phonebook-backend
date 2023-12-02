require('dotenv').config()
const express = require('express')
/* const morgan = require('morgan') */
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.disable('x-powered-by')
app.use(express.static('dist'))

/* morgan.token('body', (request, response) => JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body')) */


/* app.use(requestLogger)  */

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    Person.findById(id)
    .then(person => {
      console.log(person)
      if (person) {
        response.json(person)
      } else {
        response.status(400).end()
      }
    })
    .catch(error => next(error))
  }
})

app.get('/info', (request, response) => {
  const date = new Date()

  Person.find({}).then(persons => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p>
            <p>${date.toISOString().split('T')[0]}</p>`
    )
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if(!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const { name, number } = request.body

  Person.findByIdAndUpdate(id, { name, number}, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findByIdAndDelete(id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

function unknownEndpoint(request, response) {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

function errorHandler(error, request, response, next) {
  console.error(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

