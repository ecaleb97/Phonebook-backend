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

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id

  Person.findById(id).then(person => {
    response.json(person)
  })
})

app.post('/api/persons', async (request, response) => {
  const body = request.body

  if(!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }

  const names = await Person.find({})

  const namesArray = names.map(name => name.name)

  if(namesArray.includes(body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.put('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id

  Person.findByIdAndDelete(id).then(result => {
    response.status(204).end()
  })
})

function unknownEndpoint(request, response) {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

