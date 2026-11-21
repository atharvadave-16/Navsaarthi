import { Satellite, Smartphone } from 'lucide-react'

// Shows the 4G <-> NavIC handoff on both dashboards
export default function ModeBadge({ mode, label }) {
  const navic = mode === 'NAVIC'
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${navic ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400' : 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400'}`}>
      {navic ? <Satellite className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
      {label || (navic ? 'NavIC-only (simulated)' : '4G cellular')}
    </div>
  )
}

export function SimNotice({ children }) {
  return <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">{children}</p>
}
