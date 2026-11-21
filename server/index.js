// Tiny relay: serves the built app (dist/) and shares state between devices over WebSocket (/ws).
// Everything it relays is simulated demo data. No database, state lives in memory.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocketServer } from 'ws'

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const PORT = process.env.PORT || 3001
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon',
}

let state = {} // latest value of every shared key

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0])
  if (urlPath === '/healthz') { res.writeHead(200); return res.end('ok') }
  let file = path.join(DIST, urlPath)
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html')
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Build first: npm run build') }
    const headers = { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' }
    if (file.endsWith('sw.js') || file.endsWith('index.html')) headers['Cache-Control'] = 'no-cache'
    res.writeHead(200, headers)
    res.end(buf)
  })
})

const wss = new WebSocketServer({ server, path: '/ws' })

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'snapshot', s: state }))
  ws.on('message', (raw) => {
    let m
    try { m = JSON.parse(raw) } catch { return }
    if (m.type !== 'patch' || typeof m.p !== 'object' || m.p === null) return
    state = { ...state, ...m.p }
    const out = JSON.stringify(m)
    for (const client of wss.clients) if (client !== ws && client.readyState === 1) client.send(out)
  })
})

server.listen(PORT, () => console.log(`Navsaarthi server on http://localhost:${PORT}`))
