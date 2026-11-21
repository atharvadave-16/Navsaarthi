import * as turf from '@turf/turf'
import { COAST, IMBL, INDIA_SIDE_REF, HARBOURS, CYCLONE, BOUNDS } from '../data/geo.js'

const KM = { units: 'kilometers' }
const pt = (lng, lat) => turf.point([lng, lat])

export const CELL_RANGE_KM = 15
export const IMBL_WARN_KM = 5
export const IMBL_CRIT_KM = 2
export const BOAT_SPEED_KMH = 15 // ~8 knots, used for ETA

// 15 km cellular coverage band along the coast (for drawing on the map)
export const COVERAGE = turf.buffer(COAST, CELL_RANGE_KM, KM)

export const distToCoast = (lng, lat) => turf.pointToLineDistance(pt(lng, lat), COAST, KM)
export const distToImbl = (lng, lat) => turf.pointToLineDistance(pt(lng, lat), IMBL, KM)

const side = (a, b, p) => Math.sign((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]))

export function hasCrossedImbl(lng, lat) {
  const coords = IMBL.geometry.coordinates
  const np = turf.nearestPointOnLine(IMBL, pt(lng, lat))
  const i = Math.min(np.properties.index, coords.length - 2)
  return side(coords[i], coords[i + 1], [lng, lat]) !== side(coords[i], coords[i + 1], INDIA_SIDE_REF)
}

export const distToCyclone = (lng, lat) => turf.distance(pt(lng, lat), turf.point(CYCLONE.center), KM)

export function cycloneZone(lng, lat) {
  const d = distToCyclone(lng, lat)
  if (d <= CYCLONE.criticalKm) return 'critical'
  if (d <= CYCLONE.warningKm) return 'warning'
  return 'none'
}

export const clampToBounds = (lng, lat) => ({
  lng: Math.min(BOUNDS.maxLng, Math.max(BOUNDS.minLng, lng)),
  lat: Math.min(BOUNDS.maxLat, Math.max(BOUNDS.minLat, lat)),
})

const rank = { none: 0, safe: 0, warning: 1, critical: 2 }

/** Full risk picture for a position. */
export function assess(lng, lat, cycloneActive = false) {
  const dCoast = distToCoast(lng, lat)
  const dImbl = distToImbl(lng, lat)
  const crossed = hasCrossedImbl(lng, lat)
  const imbl = crossed || dImbl <= IMBL_CRIT_KM ? 'critical' : dImbl <= IMBL_WARN_KM ? 'warning' : 'none'
  const cyc = cycloneActive ? cycloneZone(lng, lat) : 'none'
  const worst = rank[imbl] >= rank[cyc] ? imbl : cyc
  return {
    mode: dCoast > CELL_RANGE_KM ? 'NAVIC' : '4G',
    distCoast: +dCoast.toFixed(1),
    distImbl: +dImbl.toFixed(1),
    crossed,
    imbl,
    cyc,
    risk: worst === 'none' ? 'safe' : worst,
  }
}

export const compass = (deg) => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(((deg % 360) + 360) % 360 / 45) % 8]

/**
 * Nearest harbour. When the cyclone is active, harbours whose straight route
 * passes through the critical zone (or that sit inside it) are skipped.
 */
export function nearestHarbour(lng, lat, cycloneActive = false) {
  const from = pt(lng, lat)
  const rows = HARBOURS.map((h) => {
    const to = turf.point([h.lng, h.lat])
    const km = turf.distance(from, to, KM)
    const bearing = (turf.bearing(from, to) + 360) % 360
    const blocked =
      cycloneActive &&
      (turf.distance(to, turf.point(CYCLONE.center), KM) <= CYCLONE.criticalKm ||
        turf.pointToLineDistance(turf.point(CYCLONE.center), turf.lineString([[lng, lat], [h.lng, h.lat]]), KM) <= CYCLONE.criticalKm)
    return { harbour: h, km: +km.toFixed(1), bearing: Math.round(bearing), compass: compass(bearing), etaMin: Math.round((km / BOAT_SPEED_KMH) * 60), blocked }
  }).sort((a, b) => a.km - b.km)
  const safe = rows.find((r) => !r.blocked)
  return { ...(safe || rows[0]), allBlocked: !safe, skipped: rows.filter((r) => r.blocked).length }
}
