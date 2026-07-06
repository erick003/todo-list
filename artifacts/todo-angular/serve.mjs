import { createServer, request as httpRequest } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';
import { parse } from 'url';

const port    = process.env.PORT     || 4200;
const apiPort = process.env.API_PORT || 8080;
const dir     = join(import.meta.dirname, 'dist', 'browser');

// Dados em memória — tarefas de exemplo
let todos = [
  { id: 1, text: 'Aprender Angular', description: 'Estudar Angular 17 com Signals', priority: 1, completed: false, createdAt: new Date().toISOString() },
  { id: 2, text: 'Implementar Tailwind', description: 'Configurar Tailwind CSS no projeto', priority: 2, completed: true, createdAt: new Date().toISOString() },
  { id: 3, text: 'Criar autenticação', description: 'Login com jwt', priority: 1, completed: false, createdAt: new Date().toISOString() },
];
let nextId = 4;

function startApiServer() {
  createServer((req, res) => {
    const { pathname, query } = parse(req.url, true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (pathname === '/todos' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(todos));
    } else if (pathname === '/todos' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = JSON.parse(body);
        const newTodo = { id: nextId++, ...data, createdAt: new Date().toISOString() };
        todos.unshift(newTodo);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTodo));
      });
    } else if (pathname.startsWith('/todos/') && req.method === 'GET') {
      const id = Number(pathname.split('/')[2]);
      const todo = todos.find(t => t.id === id);
      if (todo) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(todo));
      } else {
        res.writeHead(404);
        res.end();
      }
    } else if (pathname.startsWith('/todos/') && req.method === 'PUT') {
      const id = Number(pathname.split('/')[2]);
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = JSON.parse(body);
        const idx = todos.findIndex(t => t.id === id);
        if (idx >= 0) {
          todos[idx] = { ...todos[idx], ...data, createdAt: todos[idx].createdAt };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(todos[idx]));
        } else {
          res.writeHead(404);
          res.end();
        }
      });
    } else if (pathname.startsWith('/todos/') && req.method === 'DELETE') {
      const id = Number(pathname.split('/')[2]);
      todos = todos.filter(t => t.id !== id);
      res.writeHead(204);
      res.end();
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }).listen(apiPort, '0.0.0.0', () => {
    console.log(`  ➜  API server rodando em http://localhost:${apiPort}`);
  });
}

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

function startWebServer() {
  createServer((req, res) => {
    if (req.url.startsWith('/api')) {
      const apiPath = req.url.replace('/api', '');
      const proxy = httpRequest(
        { hostname: 'localhost', port: apiPort, path: apiPath, method: req.method, headers: req.headers },
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
}

startApiServer();
startWebServer();
