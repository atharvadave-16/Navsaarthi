import { useState } from 'react'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import { useStore } from '../../store/useStore.js'

// Demo controls to move the main vessel (steps are in degrees, ~1 degree = 111 km)
export default function ControlPad({ label = 'Move boat (demo)' }) {
  const moveMain = useStore((s) => s.moveMain)
  const [fast, setFast] = useState(false)
  const d = fast ? 0.08 : 0.03
  const btn = 'flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-600'
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="grid grid-cols-3 gap-1.5">
        <span />
        <button aria-label="North" className={btn} onClick={() => moveMain(0, d)}><ArrowUp /></button>
        <span />
        <button aria-label="West" className={btn} onClick={() => moveMain(-d, 0)}><ArrowLeft /></button>
        <button aria-label="South" className={btn} onClick={() => moveMain(0, -d)}><ArrowDown /></button>
        <button aria-label="East" className={btn} onClick={() => moveMain(d, 0)}><ArrowRight /></button>
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-400">
        <input type="checkbox" checked={fast} onChange={(e) => setFast(e.target.checked)} /> Big steps
      </label>
    </div>
  )
}
