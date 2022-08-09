const express = require('express')
const app = express()
var cors = require('cors')

app.use(express.json())
app.use(cors())

var offer = null
var pendingRemoteDescriptions = []

app.post('/connections', function (req, res) {
    console.log('connections')
    offer = req.body
    res.json({requestBody: req.body})
})

app.get('/connections', function (req, res) {
    console.log('connections get')
    res.send(offer)
})

app.post('/remote-descriptions', function (req, res) {
    console.log('remote-descriptions post')
    pendingRemoteDescriptions.push(req.body)
    res.send('OK')
})

app.get('/remote-descriptions', function (req, res) {
    res.send(pendingRemoteDescriptions)
    pendingRemoteDescriptions = []
})

app.listen(3000)