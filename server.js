/**
 * Fitnesspark Luzern — Dev-Server mit CORS-Proxy
 *
 * Served index.html und leitet /api/visitors/:parkId an die
 * echte fitnesspark.ch WordPress-API weiter.
 *
 * Start: node server.js
 * Öffne: http://localhost:3000
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const PARK_ENDPOINTS = {
  national: 'https://www.fitnesspark.ch/wp/wp-admin/admin-ajax.php?action=single_park_update_visitors&park_id=690&location_id=54&location_name=FP_National_Luzern',
  allmend:   'https://www.fitnesspark.ch/wp/wp-admin/admin-ajax.php?action=single_park_update_visitors&park_id=6778&location_id=56&location_name=FP_Allmend_Luzern',
};

function proxyFetch(url) {
  return new Promise(function (resolve, reject) {
    https.get(url, function (res) {
      let data = '';
      res.on('data', function (chunk) { data += chunk; });
      res.on('end', function () { resolve(data.trim()); });
    }).on('error', reject);
  });
}

const server = http.createServer(async function (req, res) {
  // API proxy: /api/visitors
  if (req.url === '/api/visitors') {
    try {
      const [national, allmend] = await Promise.all([
        proxyFetch(PARK_ENDPOINTS.national),
        proxyFetch(PARK_ENDPOINTS.allmend),
      ]);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      });
      res.end(JSON.stringify({
        national: parseInt(national, 10) || 0,
        allmend:  parseInt(allmend, 10) || 0,
        timestamp: new Date().toISOString(),
      }));
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Static file serving
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.json': 'application/json',
    '.png':  'image/png',
    '.svg':  'image/svg+xml',
  };

  fs.readFile(filePath, function (err, content) {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(content);
  });
});

server.listen(PORT, function () {
  console.log('Fitnesspark Tracker läuft auf http://localhost:' + PORT);
  console.log('API-Proxy: http://localhost:' + PORT + '/api/visitors');
});
