const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => {
  console.log(req.url, 'hello request');
  let html = fs.readFileSync(__dirname + '/index.html', 'utf8');
  html = html.replace('{title}', 'Hello World!');
  res.send(html);
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});