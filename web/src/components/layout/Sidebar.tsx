import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Cctv,
  Radio,
  Clock,
  Bell,
  Settings,
  Shield,
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/cameras', label: 'Cameras', icon: Cctv },
  { to: '/live', label: 'Live', icon: Radio },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/incidents', label: 'Events', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-800/80 bg-[var(--color-surface-900)]">
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-white">Smart VMS</p>
          <p className="text-xs text-slate-500">Home · Axis VAPIX</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/15 text-blue-300'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800/80 p-3">
        <p className="rounded-lg bg-slate-800/40 px-3 py-2 text-xs text-slate-500">
          UI prototype · mock data
        </p>
      </div>
    </aside>
  )
}
