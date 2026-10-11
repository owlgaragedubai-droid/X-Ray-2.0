const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const port = process.env.PORT || 10000;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

http.createServer((req,res)=>{
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if(urlPath === '/health'){
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
    return res.end(JSON.stringify({ok:true,service:'business-xray',version:'v2'}));
  }

  const requested = path.normalize(path.join(publicDir, urlPath));
  const isSafe = requested.startsWith(publicDir);
  if(isSafe && fs.existsSync(requested) && fs.statSync(requested).isFile()){
    const ext = path.extname(requested).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=300'
    });
    return fs.createReadStream(requested).pipe(res);
  }

  const index = path.join(publicDir, 'index.html');
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  fs.createReadStream(index).pipe(res);
}).listen(port,'0.0.0.0',()=>console.log('Business X-Ray v2 listening on',port));
