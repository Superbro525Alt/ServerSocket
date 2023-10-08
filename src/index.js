const sockets = require('socket.io')
const express = require('express')
const http = require('http')
const fs = require('fs')
const { spawn } = require("child_process");


const PASSWORD = '1';

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
            var d = JSON.stringify(JSON.parse(JSON.parse(fs.readFileSync('./services.json').toString())));
            console.log(d);
            socket.emit('services', JSON.stringify(d));
        } else {
            socket.emit('login', false)
        }
    });

    socket.on('change_file', (file) => {
        console.log('Change file: ', file);
        // convert string to buffer
        const buffer = Buffer.from(file.data);
        fs.writeFileSync(file.file, buffer);

        if (file.file === './services.json') {
            var d = JSON.stringify(JSON.parse(JSON.parse(fs.readFileSync('./services.json').toString())));
            console.log(d);
            socket.emit('services', JSON.stringify(d));
        }
    });

    socket.on('start_service', (_service) => {
        var s = JSON.parse(_service);

        // execute service.start
        console.log(s)
        var service = spawn(s.start);

        var d = JSON.parse(JSON.parse(fs.readFileSync('./services.json').toString()));

        for (var i = 0; i < d.services.length; i++) {
            if (d.services[i].name === s.name) {
                d.services[i].active = true;
            }
        }

        console.log("active", d)

        fs.writeFileSync('./services.json', JSON.stringify(JSON.stringify(d)));


            var d =JSON.stringify(fs.readFileSync('./services.json').toString());
        console.log("new services", d);
        socket.emit('services', d);

        service.stdout.on("data", data => {
            console.log(`stdout: ${data}`);
            socket.emit('service_log', data);
        });

        service.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
            socket.emit('service_log', data);
        });

        service.on('error', (error) => {
            console.log(`error: ${error.message}`);
            socket.emit('service_log', error.message);
        });

        service.on("close", code => {
            console.log(`child process exited with code ${code}`);
            socket.emit('service_log', code);

            setTimeout(() => {
                var d = JSON.parse(JSON.parse(fs.readFileSync('./services.json').toString()));

                for (var i = 0; i < d.services.length; i++) {
                    if (d.services[i].name === s.name) {
                        d.services[i].active = false;
                    }
                }

                fs.writeFileSync('./services.json', JSON.stringify(JSON.stringify(d)));


                var d = JSON.stringify(JSON.parse(fs.readFileSync('./services.json').toString()));
                console.log(d);
                socket.emit('services', JSON.stringify(d));
            }, 1000);
        });
    });
});



console.log('Server starting on port 3000');
server.listen(3000);
