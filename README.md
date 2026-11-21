# Navsaarthi

Satellite-assisted coastal safety prototype for Indian fishermen. **Everything here is simulated.** The NavIC messages are made-up packets, not real satellite transmissions, and nothing is connected to the Coast Guard or any government system.

## Run

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # geo + packet tests
npm run build
```

Open `/fisherman` and `/coastguard` in **two tabs of the same browser**. They sync through BroadcastChannel.

## Demo sequence

1. Fisherman tab: boat starts near the coast on 4G.
2. Press the east arrow a few times. Past 15 km it flips to NavIC-only (simulated) on both screens.
3. Keep going east. Warning within 5 km of the IMBL, critical within 2 km or once crossed. A simulated packet like `NS|ALT|IMBL|1.8KM|PRIO:1` appears with its decoded text.
4. Coast Guard tab: click Activate Cyclone Alert. Vessels in the zones are flagged and packets are logged.
5. Fisherman tab: press SOS, choose type and crew, send.
6. Coast Guard tab: SOS log, red vessel and a route to the nearest harbour that avoids the cyclone.

## Data

Coastline, IMBL, harbours, PFZ and cyclone are hand-drawn **sample data** around the Palk Strait, not official. Real sources to plug in later: ISRO Bhuvan, ISRO MOSDAC, INCOIS, ISRO NavIC documentation.
