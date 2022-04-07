const config = require('./utils/config')
const logger = require('./utils/logger')

const express = require('express')
require('express-async-errors')
const app = express()

const cors = require('cors') // Not sure this is needed yet
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')

logger.info('Connecting to mongoDB...')
const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())
app.use('/api/users', usersRouter)
app.use('/api/blogs', blogsRouter )

module.exports = app