import { describe, it, expect } from 'vitest'
import { assess, nearestHarbour } from './geo.js'
import { encode, decode } from './navic.js'

describe('connectivity handoff', () => {
  it('uses 4G near the coast', () => expect(assess(79.1, 9.6).mode).toBe('4G'))
  it('switches to NavIC beyond 15 km', () => expect(assess(79.3, 9.6).mode).toBe('NAVIC'))
})

describe('IMBL geofence', () => {
  it('is safe far from the boundary', () => expect(assess(79.3, 9.6).imbl).toBe('none'))
  it('warns within 5 km', () => expect(assess(79.57, 9.6).imbl).toBe('warning'))
  it('is critical within 2 km', () => expect(assess(79.595, 9.6).imbl).toBe('critical'))
  it('is critical once crossed', () => {
    const a = assess(79.7, 9.6)
    expect(a.crossed).toBe(true)
    expect(a.imbl).toBe('critical')
  })
})

describe('cyclone', () => {
  it('flags a vessel in the critical zone only when active', () => {
    expect(assess(79.4, 9.6, false).cyc).toBe('none')
    expect(assess(79.4, 9.6, true).cyc).toBe('critical')
  })
  it('skips harbours whose route crosses the critical zone', () => {
    const h = nearestHarbour(79.45, 9.6, true)
    expect(h.skipped).toBeGreaterThan(0)
  })
})

describe('simulated NavIC packets', () => {
  it('encodes and decodes', () => {
    const raw = encode({ type: 'ALT', sub: 'IMBL', val: '1.8KM', prio: 1 })
    expect(raw).toBe('NS|ALT|IMBL|1.8KM|PRIO:1')
    expect(decode(raw, 'en').level).toBe('critical')
  })
})
