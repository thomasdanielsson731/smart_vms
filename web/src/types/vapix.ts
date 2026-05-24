export type VapixCredentialSource = 'runtime' | 'file' | 'env' | 'none'

export interface VapixConnectionSettings {
  user: string
  password: string
}

export interface VapixConfigStatus {
  user: string
  configured: boolean
  source: VapixCredentialSource
}

export const vapixSourceLabels: Record<VapixCredentialSource, string> = {
  runtime: 'Settings (session)',
  file: 'Settings (saved file)',
  env: 'web/.env',
  none: 'Not configured',
}
