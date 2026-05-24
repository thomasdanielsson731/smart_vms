import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { VapixConfigSync } from '@/components/settings/VapixConfigSync'

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-950)]">
      <VapixConfigSync />
      <TopBar />
      <Outlet />
    </div>
  )
}
