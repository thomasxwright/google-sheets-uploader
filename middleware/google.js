import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../config/.env") });

const auth = new google.auth.GoogleAuth({
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


export async function getMetadata() {
    const metadata = await googleSheets.spreadsheets.get({
        auth, spreadsheetId
    })
    return metadata
}
export async function readSpreadsheet(range) {
    //Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range
    })
    return getRows.data
}
export async function editSpreadsheet(range, valueInputOption, values) {
    //Write rows to spreadsheet
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range,
        valueInputOption,
        resource: {
            values: values
        }
    })
}