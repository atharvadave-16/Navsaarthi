import { create } from 'zustand'

// Sync transport.
//  - Online: WebSocket relay (server/index.js) shares state between devices.
//  - Offline: same-browser tabs still sync through BroadcastChannel, and changes are
//    queued, then sent when the link comes back (this stands in for a store-and-forward satellite link).

export const useLink = create(() => ({ online: false, queued: false }))

const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('navsaarthi-sync') : null
let ws = null
let pending = {}
let handler = () => {}
let retry = 0

const isOpen = () => !!ws && ws.readyState === 1
const refresh = () => useLink.setState({ online: isOpen(), queued: Object.keys(pending).length > 0 })

function flush() {
  if (!isOpen() || Object.keys(pending).length === 0) return
  handler({ type: 'patch', p: pending }) // keep our own offline changes after the server snapshot lands
  ws.send(JSON.stringify({ type: 'patch', p: pending }))
  pending = {}
  refresh()
}

function schedule() {
  retry += 1
  setTimeout(connect, Math.min(1000 * retry, 5000))
}

function connect() {
  if (typeof WebSocket === 'undefined' || typeof location === 'undefined') return
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  let sock
  try { sock = new WebSocket(`${proto}//${location.host}/ws`) } catch { return schedule() }
  ws = sock
  let gotSnapshot = false
  sock.onopen = () => { retry = 0; refresh() }
  sock.onmessage = (e) => {
    let m
    try { m = JSON.parse(e.data) } catch { return }
    handler(m)
    if (m.type === 'snapshot' && !gotSnapshot) { gotSnapshot = true; flush() }
  }
  sock.onclose = () => { if (ws === sock) ws = null; refresh(); schedule() }
  sock.onerror = () => sock.close()
}

export function send(msg) {
  if (isOpen()) { ws.send(JSON.stringify(msg)); return }
  bc?.postMessage(msg)
  if (msg.type === 'patch') { pending = { ...pending, ...msg.p }; refresh() }
}

export function startSync(onMessage) {
  handler = onMessage
  if (bc) {
    bc.onmessage = (e) => { if (!isOpen()) handler(e.data) }
    bc.postMessage({ type: 'hello' })
  }
  connect()
}
