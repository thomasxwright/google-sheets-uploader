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
    return googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range,
        valueInputOption,
        resource: {
            values: values
        }
    })
}

// ---------------------------
// Configurable constants
// ---------------------------
const FLUSH_DELAY_MS = 400;   // flush if no new data after this delay
const BATCH_SIZE = 750;         // number of rows per batch
const MAX_RETRIES = 3;        // retry attempts for Sheets API

// ---------------------------
// Internal state
// ---------------------------
let buffer = [];
let writeQueue = Promise.resolve();
let flushTimer = null;

// ---------------------------
// Public API
// ---------------------------

// Called by your Express route to queue a person
export function enqueuePerson(personRow) {
    buffer.push(personRow);

    // If batch full, flush immediately
    if (buffer.length >= BATCH_SIZE) {
        scheduleFlush();
    } else {
        // Otherwise schedule a delayed flush if not already pending
        if (!flushTimer) {
            flushTimer = setTimeout(scheduleFlush, FLUSH_DELAY_MS);
        }
    }
}

// ---------------------------
// Internal queue + flush logic
// ---------------------------

function scheduleFlush() {
    if (buffer.length === 0) return;
    // Clear any pending timer
    if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
    }

    // Take all current buffered rows as one batch
    const batch = buffer.splice(0, buffer.length);

    // Chain this flush to the existing queue
    writeQueue = writeQueue
        .then(() => tryAppendWithRetries(batch))
        .catch(err => {
            console.error("❌ Batch failed after retries:", err.message);
            // Keep queue alive even after an error
        });

    return writeQueue;
}

// ---------------------------
// Retry + backoff logic
// ---------------------------

async function tryAppendWithRetries(values, retries = MAX_RETRIES, baseDelay = 400) {
    try {
        console.log(`🟢 Appending ${values.length} rows starting with ${values[0][1]} and ending with ${values[values.length-1][1]}`);
        const response = await editSpreadsheet('people!B:M', 'USER_ENTERED', values)
        console.log("✅ Google Sheets append success");
        return response;
    } catch (err) {
        if (retries <= 0) throw err;

        const delay = baseDelay * Math.pow(2, MAX_RETRIES - retries); // exponential backoff
        console.warn(`⚠️ Append failed (${err.message}). Retrying in ${delay}ms...`);
        await sleep(delay);
        return tryAppendWithRetries(values, retries - 1, baseDelay);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}