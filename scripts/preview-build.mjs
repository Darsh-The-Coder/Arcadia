import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import worker from '../.output/server/index.mjs';

const root = path.resolve('.output/public');
const port = Number(process.env.PORT || 5174);
const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
// Local-only preview of the built Cloudflare worker; never a production server.
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
      return;
    }
    const response = await worker.fetch(new Request(url, { headers: req.headers }), {}, { waitUntil: () => {}, passThroughOnException: () => {} });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) { console.error(error); res.writeHead(500); res.end('Local preview could not render this page.'); }
}).listen(port, '127.0.0.1', () => console.log(`Arcadia preview: http://127.0.0.1:${port}`));
