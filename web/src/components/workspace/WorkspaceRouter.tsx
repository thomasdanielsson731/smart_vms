import type { WorkspaceId } from '@/types/chat'
import { useAuth } from '@/context/AuthContext'
import { AccessDenied } from '@/components/auth/AccessDenied'
import { WorkspaceChrome } from './WorkspaceChrome'
import { VideoWorkspace } from './VideoWorkspace'
import { DashboardWorkspace } from './DashboardWorkspace'
import { TrackingWorkspace } from './TrackingWorkspace'
import { AgentsWorkspace } from './AgentsWorkspace'
import { OnboardingWorkspace } from './OnboardingWorkspace'
import { AlarmCreateWorkspace } from './AlarmCreateWorkspace'
import { ForensicWorkspace } from './ForensicWorkspace'
import { MapWorkspace } from './MapWorkspace'
import { FaceRecognitionWorkspace } from './FaceRecognitionWorkspace'
import { CameraWebWorkspace } from './CameraWebWorkspace'
import { SettingsPage } from '@/pages/SettingsPage'
import { isFaceRecognitionEnabled } from '@/lib/feature-flags'

export function WorkspaceRouter({ workspace }: { workspace: Exclude<WorkspaceId, null> }) {
  const { canAccessWorkspace } = useAuth()

  if (!canAccessWorkspace(workspace)) {
    return (
      <WorkspaceChrome workspace={workspace}>
        <AccessDenied workspace={workspace} />
      </WorkspaceChrome>
    )
  }

  let content: React.ReactNode
  switch (workspace) {
    case 'video':
      content = <VideoWorkspace />
      break
    case 'dashboard':
      content = <DashboardWorkspace />
      break
    case 'tracking':
      content = <TrackingWorkspace />
      break
    case 'agents':
      content = <AgentsWorkspace />
      break
    case 'onboarding':
      content = <OnboardingWorkspace />
      break
    case 'alarms':
      content = <AlarmCreateWorkspace />
      break
    case 'forensic':
      content = <ForensicWorkspace />
      break
    case 'map':
      content = <MapWorkspace />
      break
    case 'faces':
      content = isFaceRecognitionEnabled() ? (
        <FaceRecognitionWorkspace />
      ) : (
        <p className="text-sm text-slate-400">
          Face recognition is disabled. Set{' '}
          <code className="text-slate-300">VITE_FACE_RECOGNITION_ENABLED=true</code> to enable.
        </p>
      )
      break
    case 'camera-web':
      content = <CameraWebWorkspace />
      break
    case 'settings':
      content = <SettingsPage />
      break
    default:
      content = null
  }

  return <WorkspaceChrome workspace={workspace}>{content}</WorkspaceChrome>
}
