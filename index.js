// import dependencies
var HTTP = require('http');
var IO = require('socket.io');
var connect = require('connect'),
    url = require("url"),
    path = require("path"),
    fs = require("fs");


// Create a basic web server
var server = HTTP.createServer(function(request, response) {

    var uri = url.parse(request.url).pathname
        , filename = path.join(process.cwd(), uri);

    fs.exists(filename, function(exists) {
        if(!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

        fs.readFile(filename, "binary", function(err, file) {
            if(err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, "binary");
            response.end();
        });
    });
})

// HTTP server will listen on port 81
server.listen(81);
// create a WebSocket listener for the same server
var realtimeListener = IO.listen(server);

// socket to the card table
var tableSocket;

realtimeListener.on('connection', function (socket) {

    // receives a connect message from the card table
    socket.on("table-connect", function () {
        // ...  and stores the card table socket
        tableSocket = socket;
        console.log("table-connect");
    });

    socket.on("phone-connect", function () {
       console.log("phone-connect");
    });

    // receives a throw card message from a phone
    socket.on('phone-action', function (cardData) {
        console.log("phone-action");
        if (tableSocket) {
            // ... and forwards the data to the card table
            tableSocket.emit('phone-action', cardData);
        }
    });
});