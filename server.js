const http = require('http');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));
const port = process.env.PORT || 10000;

http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
    return res.end(JSON.stringify({ok:true, service:'business-xray'}));
  }
  res.writeHead(200, {
    'Content-Type':'text/html; charset=utf-8',
    'Cache-Control':'no-store'
  });
  res.end(html);
}).listen(port, '0.0.0.0', () => {
  console.log('Business X-Ray listening on', port);
});
