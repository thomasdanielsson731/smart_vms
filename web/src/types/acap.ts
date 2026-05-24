export interface AcapApplication {
  name: string
  niceName?: string
  vendor?: string
  version?: string
  status?: string
  license?: string
}

export interface CameraAcapsResponse {
  host: string
  applications: AcapApplication[]
  error?: string
}
