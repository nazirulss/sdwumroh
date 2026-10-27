const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);

  // Clean routing matching vercel.json
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  } else if (
    reqPath === '/app' ||
    reqPath === '/admin' ||
    reqPath === '/jamaah' ||
    reqPath === '/backoffice' ||
    reqPath.startsWith('/app/')
  ) {
    reqPath = '/app.html';
  }

  let filePath = path.join(ROOT, reqPath);

  // Clean URLs: check if adding .html matches an existing file
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  } else if (!fs.existsSync(filePath)) {
    filePath = path.join(ROOT, 'index.html');
  } else if (fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`\n====================================================`);
  console.log(`🕋 SDW UMROH Dev Server berjalan di:`);
  console.log(`   - Portal Publik (Landing): http://localhost:${PORT}/`);
  console.log(`   - Jamaah PWA & Backoffice: http://localhost:${PORT}/app`);
  console.log(`====================================================\n`);
});
