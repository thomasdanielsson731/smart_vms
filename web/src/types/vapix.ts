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
  runtime: 'Inställningar (session)',
  file: 'Inställningar (sparad fil)',
  env: 'web/.env',
  none: 'Ej konfigurerad',
}
