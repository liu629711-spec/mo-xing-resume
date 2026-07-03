/**
 * 本地开发服务器：静态文件 + samsy-ninja 所需的 COOP/COEP 头。
 * 普通 npx serve 缺少这些头，会导致 Draco Worker / SharedArrayBuffer 失败，页面卡在 LOADING。
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PREFERRED = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.vrm': 'model/gltf-binary',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const rel = decoded.replace(/^\/+/, '') || 'index.html';
  const resolved = path.normalize(path.join(ROOT, rel));
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

function applySamsyHeaders(res, filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel.startsWith('samsy/') || rel.endsWith('.wasm') || rel.endsWith('.glb') || rel.endsWith('.vrm')) {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}

function startServer(port) {
  const server = http.createServer(handler);
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (port < PREFERRED + 10) {
        console.warn(`端口 ${port} 已被占用，尝试 ${port + 1}…`);
        startServer(port + 1);
        return;
      }
      console.error(`\n端口 ${PREFERRED}–${port} 均被占用。请先结束旧服务：`);
      console.error('  netstat -ano | findstr ":3000"');
      console.error('  taskkill /PID <进程号> /F');
      console.error('或指定其他端口：$env:PORT=3002; npm run dev\n');
      process.exit(1);
    }
    throw err;
  });
  server.listen(port, () => {
    console.log(`Dev server: http://localhost:${port}`);
    console.log(`  水墨主题: http://localhost:${port}/?theme=ink`);
    console.log(`  复古 3D:  http://localhost:${port}/?theme=retro  → 跳转 /samsy/`);
    console.log(`  samsy 直链: http://localhost:${port}/samsy/index.html?forceWebGL=true&cdn=false`);
  });
}

function handler(req, res) {
  let filePath = safePath(req.url || '/');
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 Not Found: ${req.url}`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  applySamsyHeaders(res, filePath);

  if (ext === '.html') {
    res.setHeader('Cache-Control', 'no-cache');
  }

  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
}

startServer(PREFERRED);
