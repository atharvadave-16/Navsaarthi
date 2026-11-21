# Navsaarthi

**Satellite-assisted coastal safety prototype for Indian fishermen.**

Navsaarthi shows how fishermen who sail beyond mobile coverage could still receive clear safety warnings and send an SOS, using a NavIC-style short-message channel. It has two screens that stay in sync: a very simple **Fisherman app** and a **Coast Guard command dashboard**.

> **Important:** this is a hackathon prototype. All satellite messages, vessels, alerts and boundaries are **simulated**. Nothing here is connected to NavIC, the Indian Coast Guard, or any government system, and the packets are not real satellite transmissions.

---

## Live demo

| Screen | URL |
|---|---|
| Home | `https://navsaarthi.onrender.com` |
| Fisherman app (open on a phone) | `https://navsaarthi.onrender.com/fisherman` |
| Coast Guard dashboard (open on a laptop) | `https://navsaarthi.onrender.com/coastguard` |

Source code: https://github.com/atharvadave-16/Navsaarthi

**How to access it**

1. Open the Coast Guard URL on a laptop and the Fisherman URL on a phone (or a second browser window). They can be on different networks.
2. Both screens should show a green **Live link** badge. Anything you do on one appears on the other within a moment.
3. Use **only one** Coast Guard screen at a time. It is the screen that moves the other simulated boats.

**Before a demo:** the app is hosted on Render's free plan, which sleeps when idle. Open `https://navsaarthi.onrender.com/healthz` a few minutes early. When it says `ok`, the server is awake. Then press **Reset demo** on the Coast Guard screen.

---

## The problem

Far from the coast, fishermen lose conventional mobile network. That makes them vulnerable to:

- Accidentally crossing the International Maritime Boundary Line (IMBL)
- Sudden cyclones, storms and high waves
- Delayed communication with emergency responders
- Difficulty finding a safe harbour in an emergency

## Features

### Fisherman app (`/fisherman`)

Mobile-first, large buttons, minimal technical language.

- **Sea safety status**: big green / amber / red status (SAFE, CAUTION, DANGER)
- **Connectivity status**: 4G Mobile or NavIC-only (simulated), with the boat ID, coordinates and distance from the coast
- **Emergency SOS**: large pulsing button. Choose what happened (engine failure, medical, boat sinking, storm) and the crew count, then send
- **Danger alerts**: IMBL proximity and cyclone warnings in plain language, each with its simulated NavIC packet shown underneath
- **Safe harbour navigation**: nearest suitable harbour with distance, compass direction arrow and estimated travel time. Harbours whose route passes through the cyclone are skipped
- **Languages**: English, Hindi, Tamil and Gujarati
- **Audio alerts**: a Listen button reads warnings aloud using the browser's speech synthesis
- **Demo controls**: arrow pad to move the boat (with a "big steps" option)
- **Link badge**: shows whether the screen is connected, and whether changes are queued

### Coast Guard dashboard (`/coastguard`)

Information-dense command view.

- **Interactive map** (dark theme) with: coastline, IMBL, 15 km cellular coverage band, safe harbours, Potential Fishing Zones, cyclone warning and critical zones, vessels, and the evacuation route
- **Live statistics**: active vessels, vessels outside cellular coverage, active danger alerts, active SOS
- **Vessel simulation**: 1 main vessel (drag it on the map or use the arrow pad) plus 5 moving fishing vessels, colour-coded by status
- **SOS log**: boat ID, coordinates, emergency type, crew count, time, and the suggested harbour route. SOS vessels turn red and pulse. SOS can be marked resolved
- **Vessel table**: link type (4G / NavIC) and risk for every vessel
- **Packet log**: every simulated NavIC packet, both raw and decoded to readable text
- **Simulation controls**: move the main vessel, **Activate Cyclone Alert**, **Reset demo**

## How the simulation works

| Behaviour | Rule |
|---|---|
| Connectivity handoff | Beyond **15 km** from the coast, a vessel switches from 4G Cellular to **NavIC-only** (labelled as simulated on both screens) |
| IMBL warning | Within **5 km** of the boundary |
| IMBL critical | Within **2 km**, or once the boundary is crossed |
| Cyclone | Fixed demo storm. **Warning zone 60 km** radius, **critical zone 30 km** radius. Vessels inside either zone are flagged and receive an alert packet |
| Safe harbour | Nearest of 5 sample harbours. Skips any harbour inside the critical zone or whose straight route crosses it. Distance, bearing, and ETA at an assumed 15 km/h |
| SOS | Marks the vessel red, logs the event, and shows the route to the nearest safe harbour |

### Simulated NavIC message format

Short, compact packets with a fixed layout:

```
NS|<TYPE>|<SUBTYPE>|<VALUE>|PRIO:<n>
```

| Example | Meaning |
|---|---|
| `NS\|ALT\|IMBL\|1.8KM\|PRIO:1` | Critical: 1.8 km from the boundary |
| `NS\|ALT\|IMBL\|4.2KM\|PRIO:2` | Warning: approaching the boundary |
| `NS\|ALT\|CYC\|CRIT\|PRIO:1` | Inside the cyclone critical zone |
| `NS\|INF\|MODE\|NAVIC\|PRIO:3` | Switched to NavIC-only mode |
| `NS\|SOS\|<BOAT-ID>\|4CREW\|PRIO:0` | Emergency from a vessel |

Each packet is decoded into a plain sentence in the chosen language, for example: *"Warning! You are approaching the international maritime boundary. Change your direction."* Both the raw packet and the readable message are shown.

## Sync and offline

- **Cross-device sync:** a small Node server (`server/index.js`) relays state between screens over WebSocket (`/ws`). It keeps the latest state in memory, so a restart resets the demo.
- **Same-browser fallback:** if the server is unreachable, tabs of the same browser still sync through `BroadcastChannel`.
- **Offline use:** after one online visit, a service worker caches the app so it opens with no internet. Warnings, geofencing, voice and harbour guidance all run on the device. Changes made while offline (for example an SOS) are queued and sent when the link returns, mimicking a store-and-forward satellite link.
- **Honest limit:** a phone browser cannot send or receive real satellite messages. That needs NavIC-capable hardware. In this prototype, the server link stands in for the satellite channel.
- Offline caching needs https (the Render URL has it) or `localhost`.

## Tech stack

- React 19 + Vite
- Tailwind CSS
- Leaflet / React Leaflet (OpenStreetMap tiles, darkened with CSS)
- Turf.js for geospatial calculations
- Zustand for shared state
- Lucide React icons
- Node + `ws` for the sync relay
- Vitest for tests
- Hosted on Render (single Web Service)

## Project structure

```
server/index.js            Sync relay + static file server
public/                    Service worker, web manifest, icons
src/
  App.jsx, main.jsx        Routes and entry (registers the service worker)
  pages/                   Fisherman.jsx, CoastGuard.jsx
  components/shared/       ControlPad, ModeBadge, LinkStatus
  store/useStore.js        Shared state, actions, simulation, sync wiring
  lib/
    geo.js                 Turf logic: coast / IMBL distance, cyclone, harbours
    navic.js               Simulated packet encoder / decoder
    i18n.js                English, Hindi, Tamil, Gujarati text
    speech.js              Speech synthesis helper
    sync.js                WebSocket + BroadcastChannel transport, offline queue
    geo.test.js            Tests
  data/geo.js              Sample coastline, IMBL, harbours, PFZ, cyclone
```

## Run it locally

Requires Node 20.19+ (22 recommended).

```bash
git clone https://github.com/atharvadave-16/Navsaarthi.git
cd Navsaarthi
npm install
npm run dev:all
```

`dev:all` starts the sync relay (port 3001) and Vite (port 5173).

- Same computer: open `http://localhost:5173/fisherman` and `http://localhost:5173/coastguard`
- Phone on the same Wi-Fi: find your laptop's IPv4 address (`ipconfig`) and open `http://<laptop-ip>:5173/fisherman`

Other commands:

```bash
npm test          # geo + packet tests
npm run build     # production build into dist/
npm start         # serve dist/ and the relay on port 3001
```

## Deploy on Render

One **Web Service** serves both the app and the sync relay.

| Setting | Value |
|---|---|
| Runtime | Node |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm start` |
| Environment variable | `NODE_VERSION` = `22` |
| Instance type | Free |

Every push to `main` redeploys automatically. Use `/healthz` as a quick check that the server is awake.

## Suggested demo flow

1. **Fisherman app:** the boat starts near the coast on **4G**, status SAFE.
2. Press the east arrow. Beyond 15 km it flips to **NavIC-only (simulated)** on both screens.
3. Keep going east. **Warning** within 5 km of the IMBL, then **critical** within 2 km. A packet appears with its decoded message. Press **Listen** and try another language.
4. **Coast Guard:** click **Activate Cyclone Alert**. Warning and critical zones appear, and affected vessels are flagged.
5. **Fisherman app:** press **SOS**, choose the type and crew, and send.
6. **Coast Guard:** the vessel turns red, the SOS appears in the log, and the route to the safest harbour is drawn (avoiding the storm).
7. Optional offline check: on the phone, load the app, switch to airplane mode, reopen it, press SOS, then turn the network back on and watch it arrive.

## Data and attribution

### What the prototype uses today

The coastline, IMBL, harbours, PFZ areas and cyclone are **hand-drawn sample data** around the Palk Strait (Tamil Nadu), stored in `src/data/geo.js`. They are simplified, not survey-accurate, and the IMBL line is **not** an official boundary. The cyclone is a fixed demo storm (one centre point with warning and critical radii). None of this is fetched from the sources below.

### How real data would replace the hardcoded simulation

The app is built so each simulated layer can be swapped for a real dataset without changing the alert logic. The alert, geofencing and routing code only needs the same shapes (lines, polygons, points).

| Layer in the app | Today (simulated) | Planned real source |
|---|---|---|
| Coastline and 15 km coverage band | Hand-drawn line | **ISRO Bhuvan** coastal and geographical layers |
| Cyclone and high-wave hazard zones | One fixed circle | **ISRO MOSDAC** weather and cyclone information |
| Potential Fishing Zones | Two sample rectangles | **INCOIS** PFZ advisories |
| Safe harbours and landing points | Five sample points | **INCOIS** fish landing centre information |
| Satellite short messages | Made-up `NS\|...` packets | **ISRO NavIC** technical documentation, and real NavIC-capable hardware |

Where a live feed is not available, downloaded GeoJSON files from these sources (for example a past cyclone track) can be loaded instead and clearly labelled as historical data.

> Using these sources depends on their data access terms, registration and available formats, and has not been integrated or verified in this prototype. The prototype does **not** use real government warnings and does **not** claim to be connected to any of these systems.

- Map tiles: © OpenStreetMap contributors.

## Limitations

- All vessels, alerts and packets are simulated. No real warnings are issued.
- State lives in the server's memory and resets on restart or redeploy.
- Only one Coast Guard screen should be open, since it drives the other boats.
- Speech output depends on the voices installed on the device, so Hindi, Tamil or Gujarati speech may be unavailable on some phones.
- The free Render plan sleeps after idle time, so the first load can take up to a minute.

## Future work

- Replace the hardcoded sample data with real ISRO Bhuvan, MOSDAC and INCOIS layers (see the table above)
- Integrate with real NavIC-capable messaging hardware
- Use real GPS on the fisherman's device
- Persistent storage and user accounts
- More cyclone and high-wave sources, and more languages

