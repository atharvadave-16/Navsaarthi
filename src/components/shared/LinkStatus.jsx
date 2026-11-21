import { Wifi, WifiOff } from 'lucide-react'
import { useLink } from '../../lib/sync.js'

// Shows whether this screen is connected to the sync server. Offline changes are queued and sent later.
export default function LinkStatus() {
  const { online, queued } = useLink()
  return (
    <div className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-semibold ${online ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400' : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400'}`}>
      {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      {online ? 'Live link (simulated uplink)' : queued ? 'No link: changes queued, will send when it returns' : 'No link: working offline on this device'}
    </div>
  )
}
