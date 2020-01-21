const path = require('path');
const http = require('http')
const express = require('express');
const WebSocket = require('ws')

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/')))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const wsStore = {}

wss.on('connection', function(ws, req) {
    const wsClientID = req.url.slice(1)
    ws._clientID = wsClientID
    wsStore[wsClientID] = ws
    ws.on('message', onmessage)
    ws.on('close', function() {
        console.log('[close]', this._clientID, delete wsStore[this._clientID])
        console.log('[wsStore]', Object.keys(wsStore))
    })
    console.log('[connect]', wsClientID)
    console.log('[wsStore]', Object.keys(wsStore))
})


function onmessage(message) {
    const messageParsed = JSON.parse(message)
    console.log('[onmessage]', this._clientID, messageParsed)
    const participant = getParticipant(this._clientID)
    if (participant) {
        participant.send(message)
    }
}

function getParticipant(currentClientID) {
    const participantID = Object.keys(wsStore).find(id => id != currentClientID);
    return wsStore[participantID]
}

server.listen(process.env.PORT || 8080)