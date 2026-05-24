export type AlarmTrigger = 'person' | 'vehicle' | 'vapix_motion' | 'line_cross'
export type AlarmSeverity = 'low' | 'medium' | 'high'

export interface AlarmDefinition {
  id: string
  name: string
  description: string
  cameraIds: string[]
  schedule: string
  trigger: AlarmTrigger
  zoneName?: string
  severity: AlarmSeverity
  quietHours?: string
  enabled: boolean
  createdAt: string
}

export interface AlarmDraft {
  name: string
  description: string
  cameraIds: string[]
  schedule: string
  trigger: AlarmTrigger
  zoneName: string
  severity: AlarmSeverity
  quietHours: string
}

export const defaultAlarmDraft = (): AlarmDraft => ({
  name: '',
  description: '',
  cameraIds: [],
  schedule: 'Every day 00:00–23:59',
  trigger: 'person',
  zoneName: '',
  severity: 'medium',
  quietHours: '',
})
