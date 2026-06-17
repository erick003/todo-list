import { createServer, request as httpRequest } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

const port    = process.env.PORT     || 4200;
const apiPort = process.env.API_PORT || 8080;
const dir     = join(import.meta.dirname, 'dist', 'browser');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    const proxy = httpRequest(
      { hostname: 'localhost', port: apiPort, path: req.url, method: req.method, headers: req.headers },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      },
    );
    proxy.on('error', () => {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end(`API server nao encontrado em localhost:${apiPort}`);
    });
    req.pipe(proxy, { end: true });
    return;
  }

  const urlPath = req.url.split('?')[0];
  let filePath = join(dir, urlPath);
  if (!existsSync(filePath) || extname(filePath) === '') {
    filePath = join(dir, 'index.html');
  }
  const contentType = mimeTypes[extname(filePath)] || 'application/octet-stream';
  readFile(filePath).then(content => {
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    res.end(content);
  }).catch(() => {
    res.writeHead(404);
    res.end('Not found');
  });

}).listen(port, '0.0.0.0', () => {
  console.log(`  ➜  Local:   http://localhost:${port}/`);
  console.log(`  ➜  API proxy -> localhost:${apiPort}`);
});
