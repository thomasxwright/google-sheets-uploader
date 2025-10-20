import * as google from '../middleware/google.js'


export async function recordPerson(req, res) {
    try {

    }
    catch (err) {
        console.log(err)
    }
}

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

export async function addPeopleToSpreadsheet(req, res) {
    try {
        // console.log(req.body)
        const people = req.body
            .map(person => formatPersonForSpreadsheet(person))
        //people is an array of people, each containing an array of traits
        await google.editSpreadsheet('people!B:M', 'USER_ENTERED', people)
        const range = 'people!B:M'
        const dataResult = await google.readSpreadsheet(range)
        res.send(dataResult)
    } catch (err) {
        console.log(err)
    }
}

export async function addQueryToSpreadsheet(req, res) {
    try {
        const query = req.body
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
        const zone = req.body
        await google.editSpreadsheet('zones!A:C', 'USER_ENTERED', [zone])
        const range = 'zones!A:C'
        const dataResult = await google.readSpreadsheet(range)
        res.send(dataResult)
    } catch (err) {
        console.log(err)
    }
}

function formatPersonForSpreadsheet(person) {
    person = [person.zoneId, person.name, person.DOB, person.sex, person.city, person.zipCode, person.street, person.state,
    person.coordinates.latitude, person.coordinates.longitude, person.smoker, person.searchId].map(entry => caseAdjust(entry))
    person[7] = person[7].toUpperCase()
    return person
}

function caseAdjust(str) {
    return str.toString().split(' ').map(word => word[0].toUpperCase() + word.substr(1).toLowerCase()).join(' ')
}