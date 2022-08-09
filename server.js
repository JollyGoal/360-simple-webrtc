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


// const broadcast = (data) => {

//     wss.clients.forEach(function each(client) {
//         if (client.isMaster) {
//             masterWS = client
//         }
//         else {

//         }
//     });
// }

const listners = {}
var masterWS = null

wss.on('connection', function connection(ws) {
    /* message structure
    {
        id: '',
        data: {...}
    }
    */
    ws.on('message', function incoming(data, isBinary) {
        const msg = isBinary ? data : data.toString();
        if (msg === 'master') {
            ws.isMaster = true
            masterWS = ws
            masterWS.send(JSON.stringify({
                action: 'createOffer',
                params: {
                    ids: Object.keys(listners)
                }
            }))
            console.log("master connected")
            return
        }
        const message = JSON.parse(msg)
        if (ws.isMaster) {
            const id = message.id
            const offer = message.offer
            listners[id].send(JSON.stringify(offer))
            console.log("offer sent to " + id)
            return
        }

        if (!ws.isMaster && message.id) {
            if (!(message.id in listners)) {
                // ws.pendingAnswer = false
                ws.clientId = message.id
                listners[message.id] = ws
                if (masterWS !== null) {
                    masterWS.send(JSON.stringify({
                        action: 'createOffer',
                        params: {
                            ids: Object.keys(listners)
                        }
                    }))
                }
                console.log("new client connected")
                return
            } else {
                const id = message.id
                const answer = message.answer
                if (masterWS !== null) {
                    masterWS.send(JSON.stringify({
                        action: 'answer',
                        params: {
                            id,
                            answer
                        }
                    }))
                }
                console.log("answer sent to " + id)
                return
            }
        }
    })

    ws.on('close', function close() {
        console.log('close')
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

