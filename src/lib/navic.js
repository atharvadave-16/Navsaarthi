// SIMULATED NavIC-style short messages. Not a real satellite transmission.
import { t } from './i18n.js'

export const PREFIX = 'NS'

/** encode({type:'ALT', sub:'IMBL', val:'1.8KM', prio:1}) -> "NS|ALT|IMBL|1.8KM|PRIO:1" */
export const encode = ({ type, sub, val, prio }) => [PREFIX, type, sub, val, `PRIO:${prio}`].join('|')

export function parse(raw) {
  const [prefix, type, sub, val, p] = raw.split('|')
  return { prefix, type, sub, val, prio: Number((p || 'PRIO:3').split(':')[1]) }
}

/** Packet -> human-readable text in the chosen language. */
export function decode(raw, lang = 'en') {
  const { type, sub, val, prio } = parse(raw)
  let key = 'sosSent'
  if (type === 'ALT' && sub === 'IMBL') key = prio === 1 ? 'imblCrit' : 'imblWarn'
  else if (type === 'ALT' && sub === 'CYC') key = val === 'CRIT' ? 'cycCrit' : 'cycWarn'
  else if (type === 'INF' && sub === 'MODE') key = val === 'NAVIC' ? 'navicOn' : 'cellOn'
  return { text: t(lang, key).replace('{v}', val), level: prio <= 1 ? 'critical' : prio === 2 ? 'warning' : 'info', key }
}

/** Packets that describe a vessel's current alert state. */
export function activePackets(v) {
  const out = []
  if (v.imbl !== 'none') out.push(encode({ type: 'ALT', sub: 'IMBL', val: v.crossed ? 'CROSSED' : `${v.distImbl}KM`, prio: v.imbl === 'critical' ? 1 : 2 }))
  if (v.cyc !== 'none') out.push(encode({ type: 'ALT', sub: 'CYC', val: v.cyc === 'critical' ? 'CRIT' : 'WARN', prio: v.cyc === 'critical' ? 1 : 2 }))
  if (v.mode === 'NAVIC') out.push(encode({ type: 'INF', sub: 'MODE', val: 'NAVIC', prio: 3 }))
  return out
}
