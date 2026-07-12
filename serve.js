const http = require('http');
const fs = require('fs');
const path = require('path');
const server = http.createServer((req, res) => {
  const content = fs.readFileSync(path.join(__dirname, 'preview.html'), 'utf8');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(content);
});
server.listen(3000, () => console.log('Preview at http://localhost:3000'));
