var http = require('http');
var fs = require('fs');

http.createServer(function(req, res){
  console.log(req.url, 'hello request');
  res.writeHead(200, {'Content-Type': 'text/html'});
  let html = fs.readFileSync(__dirname + '/index.html', 'utf8');
  html = html.replace('{title}', 'Hello World!');
  res.end(html);
}).listen(8080);

console.log('Server is running on port 8080');