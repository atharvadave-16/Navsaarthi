import { useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Circle, CircleMarker, Polyline, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { Activity, Anchor, CloudLightning, RotateCcw, Satellite, ShieldAlert, Siren, Ship } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import { COAST, IMBL, PFZ, HARBOURS, CYCLONE } from '../data/geo.js'
import { COVERAGE, nearestHarbour } from '../lib/geo.js'
import { decode, parse } from '../lib/navic.js'
import ControlPad from '../components/shared/ControlPad.jsx'
import ModeBadge, { SimNotice } from '../components/shared/ModeBadge.jsx'

const COLORS = { safe4g: '#22d3ee', safeNavic: '#818cf8', warning: '#f59e0b', critical: '#ef4444' }
const colorOf = (v) => (v.sos || v.risk === 'critical' ? COLORS.critical : v.risk === 'warning' ? COLORS.warning : v.mode === 'NAVIC' ? COLORS.safeNavic : COLORS.safe4g)

const icon = (color, size, pulse) =>
  L.divIcon({ className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2], html: `<div class="vessel-dot ${pulse ? 'sos-pulse' : ''}" style="width:${size}px;height:${size}px;background:${color};color:${color}"></div>` })

const ll = (lng, lat) => [lat, lng]

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 p-3">
      <Icon className={`h-8 w-8 ${tone}`} />
      <div><p className="text-2xl font-bold leading-none">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>
    </div>
  )
}

export default function CoastGuard() {
  const { main, vessels, cyclone, packets, sos, setMain, tick, toggleCyclone, resolveSOS, resetDemo } = useStore()

  useEffect(() => { const id = setInterval(tick, 1500); return () => clearInterval(id) }, [tick])

  const all = [main, ...vessels]
  const activeSos = sos.filter((e) => e.active)
  const dangers = all.filter((v) => v.imbl !== 'none' || v.cyc !== 'none').length
  const outside = all.filter((v) => v.mode === 'NAVIC').length
  const route = main.sos ? nearestHarbour(main.lng, main.lat, cyclone.active) : null

  return (
    <main className="flex min-h-screen flex-col gap-3 p-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="h-6 w-6 text-cyan-400" /> Navsaarthi · Coast Guard Command <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">SIMULATION</span></h1>
        <ModeBadge mode={main.mode} />
      </header>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat icon={Ship} label="Active vessels" value={all.length} tone="text-cyan-400" />
        <Stat icon={Satellite} label="Outside cellular (NavIC-only)" value={outside} tone="text-indigo-400" />
        <Stat icon={Activity} label="Active danger alerts" value={dangers} tone="text-amber-400" />
        <Stat icon={Siren} label="Active SOS" value={activeSos.length} tone="text-red-400" />
      </section>

      <div className="grid flex-1 gap-3 lg:grid-cols-3">
        <section className="h-[60vh] overflow-hidden rounded-xl border border-slate-700 lg:col-span-2 lg:h-auto lg:min-h-[560px]">
          <MapContainer center={[9.65, 79.4]} zoom={9} className="h-full w-full">
            <TileLayer className="dark-tiles" attribution='&copy; OpenStreetMap contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <GeoJSON data={COVERAGE} style={{ color: '#22d3ee', weight: 1, fillOpacity: 0.08, dashArray: '2 4' }} />
            <GeoJSON data={COAST} style={{ color: '#94a3b8', weight: 2 }} />
            <GeoJSON data={IMBL} style={{ color: '#ef4444', weight: 3, dashArray: '10 6' }} />
            <GeoJSON data={PFZ} style={{ color: '#34d399', weight: 1, fillOpacity: 0.15 }} onEachFeature={(f, l) => l.bindTooltip(f.properties.name)} />
            {HARBOURS.map((h) => (
              <CircleMarker key={h.id} center={ll(h.lng, h.lat)} radius={6} pathOptions={{ color: '#34d399', fillOpacity: 1 }}>
                <Tooltip>{h.name} (safe harbour)</Tooltip>
              </CircleMarker>
            ))}
            {cyclone.active && (
              <>
                <Circle center={ll(...CYCLONE.center)} radius={CYCLONE.warningKm * 1000} pathOptions={{ color: '#f59e0b', fillOpacity: 0.12 }} />
                <Circle center={ll(...CYCLONE.center)} radius={CYCLONE.criticalKm * 1000} pathOptions={{ color: '#ef4444', fillOpacity: 0.25 }} />
              </>
            )}
            {route && <Polyline positions={[ll(main.lng, main.lat), ll(route.harbour.lng, route.harbour.lat)]} pathOptions={{ color: '#34d399', weight: 4, dashArray: '8 8' }} />}
            {vessels.map((v) => (
              <Marker key={v.id} position={ll(v.lng, v.lat)} icon={icon(colorOf(v), 14, v.sos)}>
                <Tooltip>{v.id} · {v.mode} · {v.risk}</Tooltip>
              </Marker>
            ))}
            <Marker
              position={ll(main.lng, main.lat)} icon={icon(colorOf(main), 22, main.sos)} draggable
              eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); setMain(p.lng, p.lat) } }}
            >
              <Tooltip permanent direction="top">{main.id} (drag me)</Tooltip>
            </Marker>
          </MapContainer>
        </section>

        <aside className="flex flex-col gap-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
            <h2 className="mb-2 font-bold">Simulation controls</h2>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ControlPad label="Move main vessel" />
              <div className="flex flex-col gap-2">
                <button onClick={toggleCyclone} className={`flex items-center gap-2 rounded-lg px-3 py-2 font-semibold ${cyclone.active ? 'bg-amber-500 text-slate-950' : 'bg-slate-700'}`}>
                  <CloudLightning className="h-5 w-5" /> {cyclone.active ? 'Clear cyclone' : 'Activate Cyclone Alert'}
                </button>
                <button onClick={resetDemo} className="flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2"><RotateCcw className="h-4 w-4" /> Reset demo</button>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{main.id}: {main.lat.toFixed(3)}°N {main.lng.toFixed(3)}°E · {main.distCoast} km from coast · {main.distImbl} km from IMBL{main.crossed ? ' (CROSSED)' : ''}</p>
          </div>

          <div className="rounded-xl border border-red-500/50 bg-slate-900 p-3">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-red-300"><Siren className="h-5 w-5" /> SOS log</h2>
            {sos.length === 0 && <p className="text-sm text-slate-400">No emergencies.</p>}
            <ul className="flex max-h-56 flex-col gap-2 overflow-auto">
              {sos.map((e) => (
                <li key={e.id} className={`rounded-lg border p-2 text-sm ${e.active ? 'border-red-400 bg-red-500/15' : 'border-slate-700 opacity-60'}`}>
                  <p className="font-bold">{e.vessel} · {e.type} · {e.crew} crew</p>
                  <p className="text-slate-300">{e.lat}°N, {e.lng}°E · {e.time}</p>
                  <p className="flex items-center gap-1 text-emerald-300"><Anchor className="h-4 w-4" /> Route: {e.harbour}, {e.km} km {e.compass}, ~{e.etaMin} min</p>
                  {e.active && <button onClick={() => resolveSOS(e.id)} className="mt-1 rounded bg-slate-700 px-2 py-1 text-xs">Mark resolved</button>}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
            <h2 className="mb-2 font-bold">Vessels</h2>
            <div className="max-h-48 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400"><tr><th>ID</th><th>Link</th><th>Risk</th></tr></thead>
                <tbody>
                  {all.map((v) => (
                    <tr key={v.id} className="border-t border-slate-800">
                      <td className="py-1">{v.id}{v.id === main.id ? ' ★' : ''}</td>
                      <td>{v.mode === 'NAVIC' ? 'NavIC (sim)' : '4G'}</td>
                      <td style={{ color: colorOf(v) }}>{v.sos ? 'SOS' : v.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
            <h2 className="mb-2 font-bold">Simulated NavIC packet log</h2>
            <ul className="flex max-h-56 flex-col gap-2 overflow-auto">
              {packets.length === 0 && <p className="text-sm text-slate-400">No packets yet. Move the main vessel offshore.</p>}
              {packets.map((p) => (
                <li key={p.id} className="rounded-lg bg-slate-800 p-2 text-xs">
                  <p className="font-mono text-cyan-300">{p.time} {p.vessel}</p>
                  <p className="font-mono">{p.raw}</p>
                  <p className="text-slate-300">{parse(p.raw).type === 'SOS' ? 'SOS received from vessel.' : decode(p.raw, 'en').text}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <SimNotice>
        Simulated prototype. Vessels, alerts, packets and the IMBL line are sample data, not real NavIC transmissions or Coast Guard systems. Planned real sources: ISRO Bhuvan, MOSDAC, INCOIS, NavIC documentation.
      </SimNotice>
    </main>
  )
}
