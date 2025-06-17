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
  ws.on('message', async function incoming(message) {
    console.log('received: %s', message);
    await saveMessage(message);
    await getMessages();
    // Echo the message back to the client

    const payload = {
      message: `Server received: ${message}`,
      count: await getMessageCount(),
      messages: await getMessages()
    }
    ws.send(JSON.stringify(payload));
  });

  // Send a welcome message when client connects
  // ws.send('Welcome to the WebSocket server!');

  // Handle client disconnection
  ws.on('close', function close() {
    console.log('Client disconnected');
  });
});

// set database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    created_at TEXT
  )`);
});

function getMessages() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM messages', (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

function getMessageCount() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM messages', (err, row) => {
      if (err) reject(err);
      resolve(row.count);
    });
  });
}


function saveMessage(message) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO messages (message, created_at) VALUES (?, ?)', [message.toString(), new Date().toISOString()], function(err) {
      if (err) reject(err);
      console.log('Message saved', this.lastID);
      resolve(this.lastID);
    });
  });
}

function shutdown() {
  db.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// set up a cron job to clean up the database