import { Routes, Route, Link } from 'react-router-dom'
import { Anchor, ShieldAlert, Ship } from 'lucide-react'
import Fisherman from './pages/Fisherman.jsx'
import CoastGuard from './pages/CoastGuard.jsx'

function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
      <Anchor className="w-12 h-12 text-cyan-400" />
      <h1 className="text-4xl font-bold tracking-tight">Navsaarthi</h1>
      <p className="max-w-md text-slate-400">
        Satellite-assisted coastal safety prototype for Indian fishermen.
        Open both screens in two tabs to see them stay in sync.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/fisherman" target="_blank" className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950">
          <Ship className="w-5 h-5" /> Fisherman screen
        </Link>
        <Link to="/coastguard" target="_blank" className="flex items-center gap-2 rounded-xl border border-slate-600 px-6 py-3 font-semibold">
          <ShieldAlert className="w-5 h-5" /> Coast Guard dashboard
        </Link>
      </div>
      <p className="text-xs text-slate-500 max-w-md">
        All satellite messages, alerts and vessels here are simulated. This is not connected to NavIC, the Coast Guard or any government system.
      </p>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/fisherman" element={<Fisherman />} />
      <Route path="/coastguard" element={<CoastGuard />} />
    </Routes>
  )
}
