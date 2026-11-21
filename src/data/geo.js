// SAMPLE / SIMULATED DATA, hand-drawn and simplified around the Palk Strait (Tamil Nadu).
// Not survey-accurate and NOT an official boundary. Coordinates are [lng, lat].
// Real sources to swap in later: ISRO Bhuvan (coastline), INCOIS (PFZ, landing centres), MOSDAC (cyclones).

const line = (coordinates, properties = {}) => ({ type: 'Feature', properties, geometry: { type: 'LineString', coordinates } })

export const COAST = line([[79.05, 9.95], [79.01, 9.74], [79.0, 9.45], [79.12, 9.28], [79.31, 9.28], [79.42, 9.17]], { name: 'Coastline (sample)' })

export const IMBL = line([[79.8, 9.95], [79.62, 9.7], [79.58, 9.45], [79.62, 9.25], [79.7, 9.1]], { name: 'IMBL (sample, approximate)' })

// A point on the Indian side of the IMBL, used to tell which side a vessel is on.
export const INDIA_SIDE_REF = [79.0, 9.6]

export const HARBOURS = [
  { id: 'jegathapattinam', name: 'Jegathapattinam', lng: 79.1, lat: 9.98 },
  { id: 'thondi', name: 'Thondi', lng: 79.01, lat: 9.74 },
  { id: 'mandapam', name: 'Mandapam', lng: 79.12, lat: 9.28 },
  { id: 'rameswaram', name: 'Rameswaram', lng: 79.31, lat: 9.29 },
  { id: 'dhanushkodi', name: 'Dhanushkodi', lng: 79.42, lat: 9.17 },
]

const poly = (ring, name) => ({ type: 'Feature', properties: { name }, geometry: { type: 'Polygon', coordinates: [ring] } })
export const PFZ = {
  type: 'FeatureCollection',
  features: [
    poly([[79.2, 9.85], [79.4, 9.85], [79.4, 9.7], [79.2, 9.7], [79.2, 9.85]], 'PFZ A (sample)'),
    poly([[79.25, 9.5], [79.45, 9.5], [79.45, 9.38], [79.25, 9.38], [79.25, 9.5]], 'PFZ B (sample)'),
  ],
}

export const CYCLONE = { center: [79.4, 9.6], warningKm: 60, criticalKm: 30 }

export const START_MAIN = { lng: 79.1, lat: 9.6 }
export const BOUNDS = { minLng: 79.08, maxLng: 79.95, minLat: 9.36, maxLat: 9.95 }
