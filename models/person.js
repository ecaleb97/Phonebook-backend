const mongoose = require('mongoose')


mongoose.set('strictQuery', false)
const url = process.env.MONGODB_URI

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

mongoose.set('runValidators', true)

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
  },
  number: String
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

personSchema.path('number').validate((value) => {
  return value.replace(/[^0-9]/g, '').length >= 8
}, 'Phone number must have at least 8 digits')



module.exports = mongoose.model('Person', personSchema)