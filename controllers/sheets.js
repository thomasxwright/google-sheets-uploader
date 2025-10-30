import * as google from '../middleware/google.js'
import { enqueuePerson } from '../utils/googleWriter.js'

export async function getAllPersonData(req, res) {
    try {
        const data = await google.readSpreadsheet('people!B2:M')
        res.send(data)
    } catch (err) {
        console.log(err)
    }
}

export async function getMetadata(req, res) {
    try {
        const metadata = await google.getMetadata()
        res.send(metadata)
    }
    catch (err) {
        console.log(err)
    }
}

export async function readSpreadsheeet(req, res) {
    try {
        const range = 'people!A:A'
        const data = await google.readSpreadsheet(range)
        res.send(data)
    }
    catch (err) {
        console.log(err)
    }
}

export async function editSpreadsheet(req, res) {
    try {
        await google.editSpreadsheet('people!A:B', 'USER_ENTERED', [new Date().toLocaleTimeString(), 'test'])
        const range = 'people!A:A'
        const data = await google.readSpreadsheet(range)
        res.send(data)
    }
    catch (err) {
        console.log(err)
    }
}

export async function addQueryToSpreadsheet(req, res) {
    try {
        const query = req.body
        query[1] = caseAdjust(query[1])
        await google.editSpreadsheet('queries!A:H', 'USER_ENTERED', [query])
        const range = 'queries!A:H'
        const dataResult = await google.readSpreadsheet(range)
        res.send(dataResult)
    } catch (err) {
        console.log(err)
    }
}

export async function addZoneToSpreadsheet(req, res) {
    try {
        console.log('adding a zone')
        const zone = req.body
        const { zoneId, queryPoints } = zone
        const dateUpdated = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
        const formattedZoneData = [zoneId, 'yes', dateUpdated, JSON.stringify(queryPoints)]
        console.log(formattedZoneData)
        await google.editSpreadsheet('zones!A:D', 'USER_ENTERED', [formattedZoneData])
        const range = 'zones!A:D'
        const dataResult = await google.readSpreadsheet(range)
        console.log(dataResult)
        res.send(dataResult)
    } catch (err) {
        console.log(err)
    }
}

export async function addPeopleToSpreadsheet(req, res) {
    try {
        //people is an array of people, each containing an array of traits
        const people = req.body
            .map(person => formatPersonForSpreadsheet(person))
            .forEach(person => enqueuePerson(person))
        // Optionally, you can wait for current queue to drain
        // await writeQueue;

        res.send({ status: 'accepted', count: people.length })
    } catch (err) {
        console.error('Failed to enqueue:', err)
        res.status(500).send({ error: err.message })
    }
}
// ---------------------------
// Data tidyers
// ---------------------------
function formatPersonForSpreadsheet(person) {
    person = [person.zoneId, person.name, person.DOB, person.sex, person.city, person.zipCode, person.street, person.state,
    person.coordinates.latitude, person.coordinates.longitude, person.smoker, person.searchId].map(entry => caseAdjust(entry))
    person[7] = person[7].toUpperCase()
    return person
}

function caseAdjust(str) {
    return str.toString().split(' ').map(word => word[0].toUpperCase() + word.substr(1).toLowerCase()).join(' ')
}

/*
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
const people = req.body
.map(person => formatPersonForSpreadsheet(person))
console.log(`🟢 Appending ${people.length} rows`);
const response = await google.editSpreadsheet('people!B:M', 'USER_ENTERED', people)
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
*/