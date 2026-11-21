# Navsaarthi

Satellite-assisted coastal safety prototype for Indian fishermen. **Everything here is simulated.** NavIC messages are made-up packets, not real satellite transmissions, and nothing is connected to the Coast Guard or any government system.

## Run locally

```bash
npm install
npm run dev:all        # relay server (3001) + Vite (5173, reachable on your Wi-Fi)
```
- Same laptop: open `http://localhost:5173/fisherman` and `/coastguard`.
- Two devices on the same Wi-Fi: open `http://<laptop-ip>:5173/fisherman` on the phone and `/coastguard` on the laptop.

## Deploy (one Render Web Service)

Build: `npm install && npm run build` · Start: `npm start` · Env: `NODE_VERSION=22`

The server serves the built app and relays state over WebSocket (`/ws`), so any two devices on the live URL stay in sync.

## Offline

After one online visit the app is cached (service worker) and opens with no internet. Geofencing, alerts, voice and harbour guidance run on the device. Changes made while the link is down are queued and sent when it returns. Real satellite messaging needs NavIC-capable hardware, which this web prototype only simulates.

## Data

Coastline, IMBL, harbours, PFZ and cyclone are hand-drawn **sample data** around the Palk Strait, not official. Real sources to plug in later: ISRO Bhuvan, MOSDAC, INCOIS, NavIC documentation.
currently deployed on https://navsaarthi.onrender.com/fisherman
  
