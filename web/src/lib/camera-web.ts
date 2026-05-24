export function cameraDiscoverUrl(subnet?: string): string {
  if (!subnet) return '/api/camera/discover'
  return `/api/camera/discover?subnet=${encodeURIComponent(subnet)}`
}

export function cameraDeviceInfoUrl(host: string): string {
  return `/api/camera/${encodeURIComponent(host)}/device-info`
}

/** Direct URL to the camera's built-in web server (same LAN) */
export function cameraDirectWebUrl(host: string, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `http://${host}${normalized}`
}

/** Proxied URL — digest auth via Smart VMS dev server, embeddable in iframe */
export function cameraProxiedWebUrl(host: string, path = '/'): string {
  const base = `/api/camera/${encodeURIComponent(host)}/web`
  if (!path || path === '/') return base
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${base}/${normalized}`
}

/** Common Axis web UI entry points */
export const axisWebPages = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'index', label: 'Web UI', path: '/index.html' },
  { id: 'live', label: 'Live view', path: '/view/index.shtml' },
  { id: 'param', label: 'Parameters', path: '/axis-cgi/param.cgi?action=list' },
] as const
