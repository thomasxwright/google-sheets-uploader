import express from 'express'
console.log('index.js')
// require('dotenv').config({ path: './config/.env' })
import dotenv from 'dotenv'
dotenv.config({path: './config/.env'})
import * as sheetsController from './controllers/sheets.js'

const app = express()

app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(express.json({ limit: '2mb' }))

// app.put("/recordPerson", sheetsController.recordPerson)
app.get("/getMetadata", sheetsController.getMetadata)

app.get("/editSpreadsheet", sheetsController.editSpreadsheet)

app.put("/", sheetsController.addPersonToSpreadsheet)


const PORT = process.env.PORT || 1337
app.listen(PORT, (req, res) => { console.log(`running on ${PORT}`) })