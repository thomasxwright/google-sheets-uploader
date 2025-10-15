import * as google from '../middleware/google.js'


export async function recordPerson(req, res) {
    try {

    }
    catch (err) {
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

export async function addPersonToSpreadsheet(req, res) {
    try {
        const traits = req.body
        console.log(req)
        const values = [
            traits.zone,
            traits.name,
            traits.address,
            traits.DOB,
            traits.city,
            traits.state,
            traits.zipCode,
            traits.latitude,
            traits.longitude,
            traits.sex,
            traits.smoker,
            traits.searchId
        ]
        await google.editSpreadsheet('people!B:M', 'USER_ENTERED', values)
        const range = 'people!B:M'
        const dataResult = await google.readSpreadsheet(range)
        res.send(dataResult)
    } catch (err) {
        console.log(err)
    }
}