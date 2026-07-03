#!/usr/bin/env node
// Tiny static server for dist/site (dev preview only).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'site');
const port = Number(process.env.PORT ?? 4173);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(root, urlPath === '/' ? 'index.html' : urlPath));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
  }
}).listen(port, () => console.log(`portfolio-site → http://localhost:${port}`));
