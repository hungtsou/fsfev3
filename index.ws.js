const WebSocketServer = require('ws').Server;
const express = require('express');
const fs = require('fs');
const app = express();
const server = require('http').createServer();

app.get('/', (req, res) => {
  console.log(req.url, 'hello request');
  let html = fs.readFileSync(__dirname + '/index.html', 'utf8');
  html = html.replace('{title}', 'Hello World!');
  res.send(html);
});

server.on('request', app);
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Create a WebSocket server instance
const wss = new WebSocketServer({ server: server });

// Connection event handler
wss.on('connection', function connection(ws) {
  console.log('New client connected');

  // Message event handler
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    
    // Echo the message back to the client
    ws.send(`Server received: ${message}`);
  });

  // Send a welcome message when client connects
  ws.send('Welcome to the WebSocket server!');

  // Handle client disconnection
  ws.on('close', function close() {
    console.log('Client disconnected');
  });
});