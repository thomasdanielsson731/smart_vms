import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { parseConfigurationTab } from '@/lib/system-config'
import type { ConfigurationTab } from '@/types/config'
import { CameraOnboardingPanel } from '@/components/config/CameraOnboardingPanel'
import { ConfigurationCamerasPanel } from '@/components/config/ConfigurationCamerasPanel'
import {
  ConfigurationOverviewPanel,
  ConfigurationTabBar,
} from '@/components/config/ConfigurationOverviewPanel'

export function ConfigurationWorkspace({ defaultTab }: { defaultTab?: ConfigurationTab }) {
  const { canWrite } = useAuth()
  const { params, setParam } = useWorkspace()
  const [tab, setTab] = useState<ConfigurationTab>(() =>
    params.tab ? parseConfigurationTab(params.tab) : (defaultTab ?? 'overview'),
  )

  useEffect(() => {
    if (params.tab) setTab(parseConfigurationTab(params.tab))
    else if (defaultTab) setTab(defaultTab)
  }, [params.tab, defaultTab])

  const selectTab = (next: ConfigurationTab) => {
    setTab(next)
    setParam('tab', next)
  }

  const showOnboard = canWrite

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-slate-400">
        Configuration manager — registered cameras, enabled features, on-camera ACAP apps, and
        network onboarding.
      </p>

      <ConfigurationTabBar tab={tab} onChange={selectTab} showOnboard={showOnboard} />

      {tab === 'overview' && <ConfigurationOverviewPanel />}
      {tab === 'cameras' && <ConfigurationCamerasPanel />}
      {tab === 'onboard' &&
        (showOnboard ? (
          <CameraOnboardingPanel />
        ) : (
          <p className="text-sm text-slate-500">
            Only administrators can onboard cameras. Sign in as admin to add devices.
          </p>
        ))}
    </div>
  )
}
