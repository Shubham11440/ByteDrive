// app.js
const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

const indexRouter = require('./routes/index.routes')
const userRouter = require('./routes/user.routes')
const uploadRouter = require('./routes/upload.routes')

dotenv.config()

const app = express()

// View Engine Setup
app.set('view engine', 'ejs')

// Middleware
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/', indexRouter)
app.use('/user', userRouter)
app.use('/upload', uploadRouter) // This route prefix is important

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
