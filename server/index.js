const path = require('path');
const http = require('http')
const express = require('express');
const WebSocket = require('ws')

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/')))

app.get('/listOfOnlineParticipants', (req, res, next) => {
    const list = getListOfOnlineParticipants();
    res.send({ list })
})

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const sockets = {}

wss.on('connection', function(ws, req) {
    const user_id = +req.url.slice(1)
    ws.user_id = user_id
    sockets[user_id] = ws
    ws.on('message', onMessage)
    ws.on('close', onClose)
    console.log('[connect]', user_id)
    console.log('[wsStore]', Object.keys(sockets))
})

function onClose() {
    console.log('[close]', this.user_id, delete sockets[this.user_id])
    console.log('[wsStore]', Object.keys(sockets))
}


function onMessage(message) {
    const messageParsed = JSON.parse(message)
    onSingalMessage.call(this, messageParsed)
}

function onSingalMessage(message) {
    const participant = sockets[message.user_id]
    if (participant) {
        message.user_id = this.user_id
        participant.send(JSON.stringify(message))
    }
}

function getListOfOnlineParticipants() {
    const listOfOnlineParticipants = Object.keys(sockets).map(user_id => +user_id);
    return listOfOnlineParticipants;
}

server.listen(process.env.PORT || 8080)