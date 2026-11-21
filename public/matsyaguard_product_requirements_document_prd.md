# Product Requirements Document (PRD): MatsyaGuard
**Tagline:** NavIC-Enabled Coastal Safety, Geofencing & Offline Emergency Navigation for Indian Fishermen  
**Event:** ASTRA 2026 — ANTERiX Club, VIT Bhopal University (21–22 November 2026)  
**Primary Domain:** `04 | Satellite Communication, Navigation & Connectivity`  
**Secondary Synergy:** `03 | Space-Based Disaster Management` & `02 | Earth Observation`

---

## 1. Executive Summary
**MatsyaGuard** is a live, deployed web-based simulation and emergency coordination platform designed to protect Indian coastal fishermen operating beyond the ~15 km terrestrial cellular network boundary. By combining **ISRO’s NavIC Messaging Service** model, **ISRO Bhuvan** coastal mapping, **MOSDAC** ocean/cyclone hazard data, and **INCOIS** Potential Fishing Zone (PFZ) & landing centre datasets, MatsyaGuard prevents accidental International Maritime Boundary Line (IMBL) crossings and provides life-saving storm evacuation routing in zero-network ocean zones.

### Why This Aligns with ASTRA 2026 Evaluation Priorities
* **Meaningful ISRO Integration:** Directly models India's indigenous **NavIC** maritime short-message capability alongside **Bhuvan**, **MOSDAC**, and **INCOIS** datasets.
* **High Human Impact:** Addresses two recurring, real-world coastal crises in India (fishermen detention near the IMBL and casualties during sudden cyclones).
* **Live Interactive Demo:** Built as a zero-backend or lightweight frontend web app deployable to a public URL (Vercel/Netlify) to satisfy the mandatory live-link deliverable.

---

## 2. Problem Statement & Target Users

### The Problem
Over 4 million coastal fishermen in India venture 15–50+ km offshore daily. Beyond ~15 km from the coastline, conventional 4G/5G cellular networks drop completely. In these dead zones, fishermen face three critical hazards:
1. **Accidental IMBL Crossings:** Invisible maritime borders (e.g., Palk Strait between Tamil Nadu & Sri Lanka, or the Arabian Sea off Gujarat) lead to vessel seizures and arrests.
2. **Sudden Severe Weather:** Cyclones, squalls, and high-wave alerts rarely reach small motorized boats in time once cellular connectivity is lost.
3. **Delayed Search & Rescue (SAR):** Without a reliable, low-bandwidth SOS beacon and clear return vectors, Coast Guard response times are delayed during emergencies.

### Target Users
* **Primary End-User (At Sea):** Small-scale coastal fishermen requiring an ultra-simple, offline-first, regional-language alert interface with audio/visual cues.
* **Secondary User (On Shore):** Indian Coast Guard / Fisheries Department command operators monitoring vessel positions, broadcasting NavIC hazard alerts, and coordinating SOS rescues.

---

## 3. Solution Overview: Dual-Interface Architecture
To demonstrate end-to-end satellite communication convincingly during the hackathon, MatsyaGuard operates as a **single deployed web application with two synchronized views** (viewable side-by-side in split-screen mode or toggled via tabs):

1. **Coast Guard Command Dashboard (Shore View):**
   * Interactive coastal map displaying real Indian maritime zones, the IMBL boundary line, INCOIS Potential Fishing Zones (PFZs), Safe Harbors (Fish Landing Centres), and toggleable MOSDAC Cyclone/High-Wave polygons.
   * Real-time tracking of simulated fishing vessels with automated connectivity handoff (`4G Cellular` $\rightarrow$ `NavIC-Only` beyond 15 km).
   * Automated geofence engine that detects boundary/storm proximity and broadcasts compressed **NavIC Short Message** packets.

2. **Fisherman’s Boat Terminal (Offline-First Vessel View):**
   * High-contrast, low-literacy-friendly interface simulating an onboard NavIC receiver/transponder (modeled on ISRO's DAT-SG / NavIC receiver).
   * Displays live connectivity state, decoded NavIC alerts in **English + Regional Language** (Hindi / Tamil / Gujarati), raw compressed packet logs (for technical transparency), an audible alarm, a **One-Tap SOS** button, and a **Safe-Harbor Compass** pointing to the nearest safe port.

---

## 4. Government Data Sources & Simulation Strategy

### A. Real Indian Government Portals & Static/Sample Datasets
To ensure the deployed app never breaks due to slow government APIs or CORS restrictions during judging, real datasets will be pre-fetched, curated into lightweight GeoJSON/JSON files, and attributed clearly in the UI and repository:

| Government Portal | URL | Data Used in MatsyaGuard |
|---|---|---|
| **ISRO Bhuvan** | `bhuvan.nrsc.gov.in` | Coastal satellite base imagery / WMS tile overlay (with fallback to Leaflet satellite/OSM tiles). |
| **ISRO MOSDAC** | `mosdac.gov.in` | Sample cyclone track coordinates, wind-speed radii, and high-wave warning polygons over the Bay of Bengal / Arabian Sea. |
| **INCOIS** | `incois.gov.in` | Coordinates of official Fish Landing Centres (Safe Harbors), Potential Fishing Zone (PFZ) advisories, and maritime EEZ/IMBL reference lines. |
| **ISRO NavIC / IRNSS** | `isro.gov.in` | Technical specifications for NavIC Messaging Service payload constraints and Distress Alert Transmitter (DAT-SG) workflow. |

### B. Live Operational Data Generated by MatsyaGuard
* **Vessel Telemetry Stream:** Simulated GPS/NavIC coordinates (`lat`, `lon`), speed (knots), heading (degrees), and distance from shore for 6–8 active boats—plus **1 interactive user-controlled boat** that judges can drag or steer manually.
* **Spatial Geofence Engine:** Real-time browser-side geospatial calculations (using `Turf.js`) computing:
  * Distance from coastline ($d > 15\text{ km}$ triggers `NavIC-Only` mode).
  * Distance to the IMBL line ($d < 5\text{ km}$ = `WARNING`; $d < 2\text{ km}$ or crossed = `CRITICAL`).
  * Point-in-polygon detection for MOSDAC Cyclone/High-Wave zones.
* **NavIC Compressed Packet Encoder/Decoder:** Encodes alerts into ultra-compact byte-efficient strings to simulate satellite bandwidth constraints.
* **Evacuation Routing Vector:** Dynamically calculates the bearing and distance to the nearest non-storm-affected Safe Harbor.

---

## 5. Functional Requirements (Hackathon MVP Scope)

### P0 — Must-Have for 7:30 AM Submission (Core MVP)
1. **Interactive Coastal Map (Command View):**
   * Focus region: **Tamil Nadu – Palk Strait** (e.g., Rameswaram / Nagapattinam coast) *or* **Gujarat – Okha/Porbandar coast** (select one primary demo zone for high accuracy).
   * Render Coastline, 15 km Cellular Limit dashed line, IMBL Red Line, 3–5 Safe Harbors, and 2–3 PFZ zones.
2. **Interactive Vessel Simulation:**
   * Display 5+ autonomous moving boats + 1 **Active Focus Boat** linked to the Fisherman Terminal.
   * Allow judges to **drag the Focus Boat** (or use arrow/steering controls) directly across the 15 km line, toward the IMBL, or into a cyclone zone.
3. **Dynamic Hazard Toggle (MOSDAC Simulation):**
   * Button to **"Spawn / Activate Cyclone Alert"** on the map, rendering a concentric hazard polygon (Outer Warning Zone + Inner Critical Eye) and immediately recalculating risk for all boats.
4. **NavIC Packet Engine:**
   * Auto-generate compressed alert packets whenever the Focus Boat hits a hazard.
   * Display both the **Raw NavIC Payload** and the **Human-Readable Decoded Alert** on the Fisherman Terminal.
5. **One-Tap SOS & Safe-Harbor Routing:**
   * Pressing **SOS** on the Fisherman Terminal sends a priority distress packet to the Command Dashboard, flashes the vessel marker in red, logs the incident, and draws a live **Evacuation Route Line** to the nearest Safe Harbor with compass heading and ETA.
6. **Regional Language Switcher:**
   * Toggle Fisherman Terminal alerts between **English**, **Hindi**, and **Tamil** (or Gujarati, matching the chosen coast).

### P1 — Stretch Goals (Build Only If Ahead of Schedule)
* **Web Speech API Audio Alerts:** Spoken voice warnings in English/Hindi when an IMBL or Cyclone alert triggers.
* **Simulated Satellite Pass / Signal Strength Bar:** Show active NavIC satellite lock count (e.g., `7/7 IRNSS Satellites Locked`).
* **Offline PWA Support:** Basic Service Worker caching so the Fisherman Terminal continues functioning if Wi-Fi is turned off during the live demo.

---

## 6. Technical Architecture & Recommended Stack

To guarantee a zero-downtime **mandatory deployed link**, keep the entire application client-side (no complex backend database to crash at 6:00 AM):

* **Frontend Framework:** React (Vite) + Tailwind CSS *(or plain HTML5/CSS3/Vanilla JS if the team prefers zero build-step simplicity)*.
* **Mapping Library:** **Leaflet.js** (or `react-leaflet`) — lightweight, free, supports custom markers, polylines, GeoJSON polygons, and WMS layers (Bhuvan).
* **Geospatial Engine:** **Turf.js** (`@turf/turf`) — handles `pointToLineDistance`, `booleanPointInPolygon`, `bearing`, and `distance` in milliseconds inside the browser.
* **Icons & Charts:** `lucide-react` for clean maritime/emergency iconography.
* **State Synchronization:** React Context / Zustand (or `localStorage` / `BroadcastChannel` API if opening Shore and Boat views in two separate browser tabs).
* **Hosting & Deployment:** **Vercel** or **Netlify** (auto-deploys directly from the GitHub repository).

---

## 7. Data Models & NavIC Packet Specification

### Vessel Object Schema
```json
{
  "id": "TN-04-MM-1042",
  "name": "MV Kaveri Star",
  "lat": 9.2876,
  "lng": 79.3129,
  "speedKnots": 8.4,
  "heading": 115,
  "distanceFromShoreKm": 18.2,
  "networkMode": "NAVIC_ONLY",
  "status": "WARNING_IMBL",
  "sosActive": false
}
```

### Compressed NavIC Alert Packet Format (Simulated)
To reflect real satellite bandwidth limits, alerts are serialized into compact ASCII/hex-like frames under 40 bytes:

* **Downlink (Shore $\rightarrow$ Boat Hazard Alert):**  
  `NV|ALT|IMBL|1.8KM|HDG:295W|PRIO:1`  
  *(Meaning: NavIC Alert — International Maritime Boundary Line 1.8 km ahead — Turn immediately to heading 295° West — Priority 1 Critical)*

* **Downlink (Shore $\rightarrow$ Boat Cyclone Alert):**  
  `NV|WX|CYC|WND:65KT|PORT:RMM|BRG:270W`  
  *(Meaning: NavIC Weather — Cyclone warning 65 knots — Evacuate to Rameswaram Harbor at bearing 270° West)*

* **Uplink (Boat $\rightarrow$ Shore SOS Distress Beacon):**  
  `NV|SOS|TN041042|9.287N,79.312E|CREW:4|ENG_FAIL`  
  *(Meaning: NavIC SOS — Vessel TN-04-MM-1042 — Exact NavIC Lat/Lon — 4 Crew — Engine Failure)*

---

## 8. UI/UX & Live Demo Flow (For 1–2 Min Video & Final Pitch)

Design the screen around a **dark maritime command aesthetic** (deep navy `#0B132B`, radar teal `#00F5D4`, warning amber `#FFB703`, critical red `#E63946`):

* **Left 65% of Screen:** Coast Guard Command Map (Leaflet) with top KPI strip (Active Vessels, Boats in NavIC-Only Mode, Active Alerts, Active SOS) and a right-hand Alert/Packet Log drawer.
* **Right 35% of Screen:** Interactive **Fisherman’s Boat Terminal** styled like a ruggedized marine handset/tablet.

### The 90-Second Winning Demo Script
1. **Normal State (15s):** Show the Focus Boat sailing near the coast (`4G Cellular` green badge) heading toward an INCOIS Potential Fishing Zone.
2. **Dead-Zone Handoff (15s):** Drag/steer the boat past the 15 km line. Show the status flip automatically to **`NavIC-Only (IRNSS Locked)`**.
3. **IMBL Geofence Trigger (20s):** Move the boat close to the IMBL red line. Watch the Command Dashboard fire a compressed `NV|ALT|IMBL` packet, triggering a flashing red alert + Tamil/Hindi warning on the Fisherman Terminal.
4. **MOSDAC Cyclone Spawn (20s):** Click **"Activate MOSDAC Cyclone Warning"**. The storm polygon appears; the app recalculates risk for all boats.
5. **One-Tap SOS & Evacuation (20s):** Press **SOS** on the Fisherman Terminal. Watch the distress ping hit the Command Dashboard and automatically draw the **Safe-Harbor Return Route** with compass heading and distance.

---

## 9. Overnight Build Roadmap & Team Roles (21–22 Nov 2026)

| Time Window | Milestone | Key Tasks |
|---|---|---|
| **5:45 PM – 7:30 PM** | **Setup, Data & Skeleton** | Init GitHub repo + Vite/React + Tailwind + Leaflet + Turf.js. Gather static GeoJSON for Coastline, IMBL, 4 Harbors, 2 PFZs, and 1 Cyclone polygon. Deploy empty shell to Vercel early. |
| **7:30 PM – 8:15 PM** | **Dinner Break** | Recharge and align on pitch talking points. |
| **8:15 PM – 10:15 PM** | **Core Map + Pitch Prep** | Render map layers + draggable Focus Boat + 15 km & IMBL distance logic. Prepare 3–4 talking points & live prototype preview for desk-to-desk pitching. |
| **10:30 PM – 11:30 PM** | **ROUND 1: Idea Pitching** | Deliver desk-to-desk pitch (**20% of final score**). Incorporate any judge feedback immediately. |
| **11:30 PM – 3:00 AM** | **Core Feature Sprint** | Build Fisherman Terminal UI, NavIC Packet Encoder/Decoder, MOSDAC Cyclone toggle, One-Tap SOS, Safe-Harbor route line, and Regional Language toggle. |
| **3:00 AM – 5:00 AM** | **Polish, Audio & Edge Cases** | Add audio alarm / voice alerts, satellite signal visualizers, Bhuvan/MOSDAC/INCOIS attribution modal, and responsive layout fixes. |
| **5:00 AM – 6:30 AM** | **Deliverables Production** | Finalize GitHub README (with third-party acknowledgments), build the **Compulsory PPT** (7 required sections), and record the **1–2 min Demo Video**. |
| **6:30 AM – 7:15 AM** | **Final Verification & Submit** | Test live Vercel URL on incognito/mobile, verify GitHub & video link permissions, and submit the Google Form **before 7:30 AM** (safe buffer ahead of the 7:30/8:00 AM window). |

### Suggested Team Division (2–4 Members)
* **Member 1 (Geospatial & Map Lead):** Leaflet setup, Bhuvan/OSM layers, GeoJSON boundaries (IMBL, Harbors, PFZs), Turf.js distance & cyclone math.
* **Member 2 (UI/UX & Fisherman Terminal Lead):** Split-screen layout, Fisherman Boat Terminal UI, regional language translations, SOS & compass indicator.
* **Member 3 (Simulation & Packet Engine):** Vessel movement loop, NavIC packet encoder/decoder, live alert feed, state sync.
* **Member 4 (Data, Pitch & Deliverables):** Curating real MOSDAC/INCOIS coordinates, writing README attributions, designing the final PPT, and recording/editing the 1–2 min demo video. *(For 2–3 member teams, split Member 3 & 4 duties across the team).*

---

## 10. ASTRA 2026 Submission & Judging Checklist

### Four Mandatory Deliverables (Google Form)
- [ ] **GitHub Repository:** Clean source code, clear `README.md` acknowledging Leaflet, Turf.js, ISRO Bhuvan, MOSDAC, and INCOIS data.
- [ ] **Project Presentation (PPT — Compulsory):** Covers all 7 required presentation topics:
  1. Problem statement & selected domain(s)
  2. Problem identification & research
  3. Proposed solution
  4. System architecture & workflow
  5. Technologies & tools used
  6. Implementation & working prototype demonstration
  7. Impact, future scope & scalability (e.g., integrating real ISRO DAT-SG hardware / LoRaWAN coastal relays)
- [ ] **Demo Video (1–2 minutes):** Crisp screen recording following the 90-second demo script with voiceover (set link access to "Anyone with the link can view").
- [ ] **Deployed Project Link:** Live, publicly accessible Vercel/Netlify URL tested on a separate device.