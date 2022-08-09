const express = require('express')
const app = express()
var cors = require('cors')
const { WebSocketServer } = require('ws')

app.use(express.json())
app.use(cors())
app.use(express.static('public'))


const wss = new WebSocketServer({
    port: 8080,
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed if context takeover is disabled.
    }
});


wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    })
});


// app.post('/connections', function (req, res) {
//     console.log('connections')
//     offer = req.body
//     res.json({ requestBody: req.body })
// })

// app.get('/connections', function (req, res) {
//     console.log('connections get')
//     res.send(offer)
// })

// app.post('/remote-descriptions', function (req, res) {
//     console.log('remote-descriptions post')
//     pendingRemoteDescriptions.push(req.body)
//     res.send('OK')
// })

// app.get('/remote-descriptions', function (req, res) {
//     res.send(pendingRemoteDescriptions)
//     pendingRemoteDescriptions = []
// })

app.listen(3000)

