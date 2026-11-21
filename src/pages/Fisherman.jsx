import { useState } from 'react'
import { AlertTriangle, Anchor, CheckCircle2, Navigation, Siren, Volume2, XCircle } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import { nearestHarbour } from '../lib/geo.js'
import { activePackets, decode } from '../lib/navic.js'
import { LANGS, t, tType } from '../lib/i18n.js'
import { speak } from '../lib/speech.js'
import ControlPad from '../components/shared/ControlPad.jsx'
import ModeBadge, { SimNotice } from '../components/shared/ModeBadge.jsx'
import LinkStatus from '../components/shared/LinkStatus.jsx'

const THEME = {
  safe: { bg: 'bg-emerald-500/15 border-emerald-400 text-emerald-300', Icon: CheckCircle2, key: 'safe' },
  warning: { bg: 'bg-amber-500/15 border-amber-400 text-amber-300', Icon: AlertTriangle, key: 'warn' },
  critical: { bg: 'bg-red-500/20 border-red-400 text-red-300', Icon: XCircle, key: 'crit' },
}

export default function Fisherman() {
  const { main, lang, setLang, cyclone, sendSOS } = useStore()
  const [sosOpen, setSosOpen] = useState(false)
  const [type, setType] = useState('engine')
  const [crew, setCrew] = useState(4)
  const [voiceMsg, setVoiceMsg] = useState('')

  const theme = THEME[main.risk]
  const harbour = nearestHarbour(main.lng, main.lat, cyclone.active)
  const packets = activePackets(main)
  const alerts = packets.map((raw) => ({ raw, ...decode(raw, lang) }))
  const dangers = alerts.filter((a) => a.level !== 'info')

  const listen = (text) => setVoiceMsg(speak(text, lang) ? '' : 'Voice is not supported on this device.')
  const readAll = () => listen((dangers.length ? dangers : alerts).map((a) => a.text).join(' ') || t(lang, 'none'))
  const submit = () => { sendSOS({ type, crew }); setSosOpen(false); listen(t(lang, 'sosSent')) }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4 pb-10">
      <header className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold"><Anchor className="h-6 w-6 text-cyan-400" /> Navsaarthi</h1>
        <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-base">
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </header>

      <LinkStatus />

      <section className={`flex items-center gap-4 rounded-2xl border-2 p-5 ${theme.bg}`}>
        <theme.Icon className="h-14 w-14 shrink-0" />
        <div>
          <p className="text-sm opacity-80">{t(lang, 'seaStatus')}</p>
          <p className="text-4xl font-extrabold">{t(lang, theme.key)}</p>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-4">
        <span className="text-slate-400">{t(lang, 'conn')}</span>
        <ModeBadge mode={main.mode} label={main.mode === 'NAVIC' ? `${t(lang, 'navic')} (sim)` : t(lang, 'cell')} />
        <p className="w-full text-xs text-slate-500">{main.id} · {main.lat.toFixed(3)}°N {main.lng.toFixed(3)}°E · coast {main.distCoast} km</p>
      </section>

      <button
        onClick={() => setSosOpen(true)}
        disabled={main.sos}
        className={`flex h-40 w-full flex-col items-center justify-center gap-1 rounded-3xl bg-red-600 text-white shadow-lg active:bg-red-700 disabled:opacity-70 ${main.sos ? '' : 'sos-pulse'}`}
      >
        <Siren className="h-14 w-14" />
        <span className="text-5xl font-black">{t(lang, 'sos')}</span>
        <span className="text-sm">{main.sos ? t(lang, 'sosSent') : t(lang, 'sosHelp')}</span>
      </button>

      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t(lang, 'alerts')}</h2>
          <button onClick={readAll} className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950">
            <Volume2 className="h-5 w-5" /> {t(lang, 'listen')}
          </button>
        </div>
        {alerts.length === 0 && <p className="text-slate-400">{t(lang, 'none')}</p>}
        <ul className="flex flex-col gap-2">
          {alerts.map((a) => (
            <li key={a.raw} className={`rounded-xl border p-3 text-lg ${a.level === 'critical' ? 'border-red-400 bg-red-500/15' : a.level === 'warning' ? 'border-amber-400 bg-amber-500/15' : 'border-slate-600 bg-slate-800'}`}>
              <p>{a.text}</p>
              <p className="mt-1 font-mono text-[11px] text-slate-400">SIMULATED NavIC packet: {a.raw}</p>
            </li>
          ))}
        </ul>
        {voiceMsg && <p className="mt-2 text-sm text-amber-300">{voiceMsg}</p>}
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
        <h2 className="mb-3 text-lg font-bold">{t(lang, 'harbour')}</h2>
        <p className="text-2xl font-bold text-emerald-300">{harbour.harbour.name}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-800 p-3"><p className="text-xs text-slate-400">{t(lang, 'dist')}</p><p className="text-xl font-bold">{harbour.km} km</p></div>
          <div className="rounded-xl bg-slate-800 p-3">
            <p className="text-xs text-slate-400">{t(lang, 'dir')}</p>
            <Navigation className="mx-auto h-6 w-6 text-cyan-300" style={{ transform: `rotate(${harbour.bearing - 45}deg)` }} />
            <p className="text-sm font-bold">{harbour.compass}</p>
          </div>
          <div className="rounded-xl bg-slate-800 p-3"><p className="text-xs text-slate-400">{t(lang, 'eta')}</p><p className="text-xl font-bold">{harbour.etaMin} {t(lang, 'min')}</p></div>
        </div>
        {harbour.skipped > 0 && <p className="mt-2 text-xs text-amber-300">Route avoids cyclone zone ({harbour.skipped} harbour skipped).</p>}
      </section>

      <section className="rounded-2xl border border-dashed border-slate-600 p-4">
        <ControlPad label={t(lang, 'move')} />
      </section>

      <SimNotice>{t(lang, 'sim')}</SimNotice>

      {sosOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 p-5 ring-1 ring-red-500">
            <h2 className="mb-3 text-2xl font-bold text-red-300">{t(lang, 'sos')}</h2>
            <p className="mb-2 text-slate-300">{t(lang, 'type')}</p>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {['engine', 'medical', 'sinking', 'storm'].map((k) => (
                <button key={k} onClick={() => setType(tType('en', k))} className={`rounded-xl border-2 p-3 text-lg ${type === tType('en', k) ? 'border-red-400 bg-red-500/20' : 'border-slate-600'}`}>
                  {tType(lang, k)}
                </button>
              ))}
            </div>
            <div className="mb-5 flex items-center justify-between">
              <span className="text-lg">{t(lang, 'crew')}</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setCrew(Math.max(1, crew - 1))} className="h-12 w-12 rounded-xl bg-slate-700 text-2xl">−</button>
                <span className="w-8 text-center text-3xl font-bold">{crew}</span>
                <button onClick={() => setCrew(Math.min(20, crew + 1))} className="h-12 w-12 rounded-xl bg-slate-700 text-2xl">+</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setSosOpen(false)} className="rounded-xl border border-slate-500 py-4 text-lg">{t(lang, 'cancel')}</button>
              <button onClick={submit} className="rounded-xl bg-red-600 py-4 text-lg font-bold">{t(lang, 'send')}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
