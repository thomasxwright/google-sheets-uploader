import express from 'express'
import cors from 'cors'
console.log('index.js')
// require('dotenv').config({ path: './config/.env' })
import dotenv from 'dotenv'
dotenv.config({path: './config/.env'})
import * as sheetsController from './controllers/sheets.js'

const allowedOrigin = "https://t65.app"
const app = express()

app.use(
    cors({
        origin: allowedOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    })
)

app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(express.json({ limit: '2mb' }))

// app.put("/recordPerson", sheetsController.recordPerson)
app.get("/getMetadata", sheetsController.getMetadata)

app.get("/editSpreadsheet", sheetsController.editSpreadsheet)

app.get("/", sheetsController.getAllPersonData)

app.post("/people", sheetsController.addPeopleToSpreadsheet)

app.post("/queries", sheetsController.addQueryToSpreadsheet)

app.post("/zones", sheetsController.addZoneToSpreadsheet)


const PORT = process.env.PORT || 1337
app.listen(PORT, (req, res) => { console.log(`running on ${PORT}`) })