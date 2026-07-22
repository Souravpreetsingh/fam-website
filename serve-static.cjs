const http = require('http');
const fs = require('fs');
const path = require('path');
const publicDir = path.join(process.cwd(), 'public');
const mimes = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp' };
http.createServer((req, res) => {
  var urlPath = req.url.split('?')[0].split('#')[0];
  if (urlPath === '/sw.js' || urlPath === '/manifest.json') {
    res.writeHead(204);
    res.end();
    return;
  }
  let filePath = path.join(publicDir, urlPath === '/' ? 'index.html' : urlPath);
  filePath = path.normalize(filePath);
  if (!filePath.startsWith(publicDir)) { res.writeHead(403); res.end(); return; }
  
  let ext = path.extname(filePath).toLowerCase();
  if (!ext) {
    let htmlPath = filePath + '.html';
    if (fs.existsSync(htmlPath)) { filePath = htmlPath; ext = '.html'; }
  }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('File not found'); return; }
    res.writeHead(200, { 'Content-Type': mimes[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(5174, () => console.log('Static site at http://localhost:5174'));
