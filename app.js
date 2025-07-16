const express = require('express')
const userRouter = require('./routes/user.routes')
const { body, validationResult } = require('express-validator')
const dotenv = require('dotenv')
const connectToDB = require('./config/db')

dotenv.config()
connectToDB()

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/user', userRouter)

app.listen(3000, () => {
    console.log("Listening on port 3000")
})