import { create } from 'zustand'
import { assess, nearestHarbour, clampToBounds } from '../lib/geo.js'
import { encode } from '../lib/navic.js'
import { START_MAIN, BOUNDS } from '../data/geo.js'

// Both dashboards share state through BroadcastChannel (works across tabs of the same browser).
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('navsaarthi-sync') : null
const uid = () => Math.random().toString(36).slice(2, 8)
const now = () => new Date().toLocaleTimeString()

const makeVessel = (id, lng, lat, heading) => ({
  id, lng, lat, heading, sos: false,
  mode: '4G', imbl: 'none', cyc: 'none', risk: 'safe', distCoast: 0, distImbl: 0, crossed: false,
  ...assess(lng, lat, false),
})

const initialData = () => ({
  main: { ...makeVessel('TN-FB-1042', START_MAIN.lng, START_MAIN.lat, 0), name: 'Your boat' },
  vessels: [
    makeVessel('TN-FB-2101', 79.12, 9.85, 80),
    makeVessel('TN-FB-2230', 79.3, 9.78, 200),
    makeVessel('TN-FB-3317', 79.35, 9.45, 340),
    makeVessel('TN-FB-4408', 79.5, 9.88, 120),
    makeVessel('TN-FB-5562', 79.2, 9.55, 270),
  ],
  cyclone: { active: false },
  packets: [],
  sos: [],
  lang: 'en',
})
const DATA_KEYS = Object.keys(initialData())

/** Re-assess one vessel and return the packets that its changes should produce. */
function reassess(v, cycloneActive) {
  const a = assess(v.lng, v.lat, cycloneActive)
  const raws = []
  if (a.mode !== v.mode) raws.push(encode({ type: 'INF', sub: 'MODE', val: a.mode, prio: 3 }))
  if (a.imbl !== v.imbl && a.imbl !== 'none')
    raws.push(encode({ type: 'ALT', sub: 'IMBL', val: a.crossed ? 'CROSSED' : `${a.distImbl}KM`, prio: a.imbl === 'critical' ? 1 : 2 }))
  if (a.cyc !== v.cyc && a.cyc !== 'none')
    raws.push(encode({ type: 'ALT', sub: 'CYC', val: a.cyc === 'critical' ? 'CRIT' : 'WARN', prio: a.cyc === 'critical' ? 1 : 2 }))
  return { vessel: { ...v, ...a }, packets: raws.map((raw) => ({ id: uid(), time: now(), vessel: v.id, raw })) }
}

export const useStore = create((set, get) => {
  // apply locally and tell the other tab
  const patch = (p) => { set(p); channel?.postMessage({ type: 'patch', p }) }
  const withPackets = (list) => [...list, ...get().packets].slice(0, 60)

  return {
    ...initialData(),

    setLang: (lang) => patch({ lang }),

    setMain: (lng, lat) => {
      const s = get()
      const c = clampToBounds(lng, lat)
      const { vessel, packets } = reassess({ ...s.main, ...c }, s.cyclone.active)
      patch({ main: vessel, packets: withPackets(packets) })
    },
    moveMain: (dLng, dLat) => get().setMain(get().main.lng + dLng, get().main.lat + dLat),

    // Other vessels drift around. Run from the Coast Guard tab only.
    tick: () => {
      const s = get()
      let newPackets = []
      const vessels = s.vessels.map((v) => {
        if (v.sos) return v
        let heading = v.heading + (Math.random() - 0.5) * 40
        let lng = v.lng + Math.sin((heading * Math.PI) / 180) * 0.012
        let lat = v.lat + Math.cos((heading * Math.PI) / 180) * 0.012
        if (lng < BOUNDS.minLng || lng > BOUNDS.maxLng || lat < BOUNDS.minLat || lat > BOUNDS.maxLat) {
          heading = (heading + 180) % 360
          ;({ lng, lat } = clampToBounds(lng, lat))
        }
        const r = reassess({ ...v, lng, lat, heading }, s.cyclone.active)
        newPackets = newPackets.concat(r.packets)
        return r.vessel
      })
      patch({ vessels, packets: withPackets(newPackets) })
    },

    toggleCyclone: () => {
      const s = get()
      const active = !s.cyclone.active
      let newPackets = []
      const upd = (v) => { const r = reassess(v, active); newPackets = newPackets.concat(r.packets); return r.vessel }
      patch({ cyclone: { active }, main: upd(s.main), vessels: s.vessels.map(upd), packets: withPackets(newPackets) })
    },

    sendSOS: ({ type, crew }) => {
      const s = get()
      if (s.main.sos) return
      const h = nearestHarbour(s.main.lng, s.main.lat, s.cyclone.active)
      const event = {
        id: uid(), time: now(), vessel: s.main.id, lng: +s.main.lng.toFixed(4), lat: +s.main.lat.toFixed(4),
        type, crew, active: true, harbour: h.harbour.name, km: h.km, etaMin: h.etaMin, compass: h.compass,
      }
      const pk = { id: uid(), time: now(), vessel: s.main.id, raw: encode({ type: 'SOS', sub: s.main.id, val: `${crew}CREW`, prio: 0 }) }
      patch({ sos: [event, ...s.sos], main: { ...s.main, sos: true }, packets: withPackets([pk]) })
    },

    resolveSOS: (id) => {
      const s = get()
      const sos = s.sos.map((e) => (e.id === id ? { ...e, active: false } : e))
      patch({ sos, main: sos.some((e) => e.active) ? s.main : { ...s.main, sos: false } })
    },

    resetDemo: () => patch(initialData()),
  }
})

// receive updates from the other tab
if (channel) {
  channel.onmessage = ({ data }) => {
    if (data.type === 'patch') useStore.setState(data.p)
    else if (data.type === 'hello') {
      const s = useStore.getState()
      channel.postMessage({ type: 'snapshot', s: Object.fromEntries(DATA_KEYS.map((k) => [k, s[k]])) })
    } else if (data.type === 'snapshot') useStore.setState(data.s)
  }
  channel.postMessage({ type: 'hello' }) // ask any open tab for the current state
}
