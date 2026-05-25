export interface AoaApiError {
  code: number
  message: string
}

export interface AoaApiResponse<T = unknown> {
  apiVersion?: string
  context?: string
  method: string
  data?: T
  error?: AoaApiError
}

export interface AoaScenario {
  id: number
  name: string
  type: string
  metadataOverlay?: number
  alarmRate?: string
  devices?: { id: number }[]
  triggers?: unknown[]
  filters?: unknown[]
  objectClassifications?: unknown[]
  perspectives?: unknown[]
  presets?: unknown[]
}

export interface AoaConfiguration {
  devices?: { id: number; [key: string]: unknown }[]
  filters?: unknown[]
  metadataOverlay?: unknown[]
  objectClassifications?: unknown[]
  perspective?: unknown
  scenarios?: AoaScenario[]
  triggers?: unknown[]
  presets?: unknown[]
}

export interface AoaCapabilities {
  devices?: unknown[]
  filters?: unknown[]
  metadataOverlay?: unknown
  objectClassifications?: unknown
  perspective?: unknown
  scenarios?: {
    supportedScenarios?: string[]
    defaultScenario?: string
    defaultDeviceId?: number[]
    alarmRates?: string[]
    defaultAlarmRate?: string
    minNbrScenariosPerCamera?: number
    maxNbrScenariosPerCamera?: number
    [key: string]: unknown
  }
  triggers?: unknown[]
  presets?: unknown
}

export interface AoaStatusResponse {
  host: string
  available: boolean
  apiVersion?: string
  message?: string
  configuration?: AoaConfiguration
  capabilities?: AoaCapabilities
}

export interface AoaInvokeRequest {
  method: string
  params?: unknown
  apiVersion?: string
  context?: string
}
