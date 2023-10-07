const sockets = require('socket.io')

const PASSWORD = '123456';

const server = new sockets.Server({
    port: 6161
})

server.on('connection', socket => {
    console.log('New connection')
    socket.on('password', password => {
        if (password === PASSWORD) {
            socket.emit('login', true)
        } else {
            socket.emit('login', false)
        }
    }
}
