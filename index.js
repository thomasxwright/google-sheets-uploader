const express = require('express')
const { google } = require('googleapis')
require('dotenv').config({ path: './config/.env' })

const app = express()

app.get("/", async (req, res) => {
console.log(process.env.PRIVATE_KEY)
    const auth = new google.auth.GoogleAuth({
        // keyFile: "credentials.json",
        credentials: {
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY
        },
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    })

    //create client instance for auth
    const client = await auth.getClient()


    //instance of google sheets api
    const googleSheets = google.sheets({ version: "v4", auth: client })

    const spreadsheetId = process.env.SPREADSHEET_ID

    //get metadata about spreadsheet
    const metadata = await googleSheets.spreadsheets.get({
        auth, spreadsheetId
    })

    
    //Write rows to spreadsheet
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Sheet1!A:B",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [
                [
                    new Date().toLocaleTimeString(), "test"
                ]
            ]
        }
    })
    
    //Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Sheet1!A:A"
    })
    
    res.send(getRows.data)
})


const PORT = process.env.PORT || 1337
app.listen(PORT, (req, res) => { console.log('running on ${PORT}') })