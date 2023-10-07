const sockets = require('socket.io')
const express = require('express')
const http = require('http')
const fs = require('fs')

const PASSWORD = '123456';

app = express();

const server = new sockets.Server(http.createServer(app), {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

server.on('connection', socket => {
    console.log('New connection')
    socket.on('password', password => {
        console.log('Password received: ', password)
        if (password === PASSWORD) {
            socket.emit('login', true)

            socket.emit('services', JSON.stringify(fs.readFileSync('./services.json')));
        } else {
            socket.emit('login', false)
        }
    })
});

console.log('Server starting on port 3000');
server.listen(3000);
