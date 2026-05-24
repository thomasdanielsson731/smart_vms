export type ConfigurationTab = 'overview' | 'cameras' | 'onboard'

export interface SystemFeature {
  id: string
  label: string
  description: string
  enabled: boolean
  source: 'env' | 'runtime' | 'settings'
  configureHint?: string
}
