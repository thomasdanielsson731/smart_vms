import type { DiscoveredCamera } from '@/types/onboarding'
import { getEnvCameraHosts } from '@/lib/camera-hosts-storage'

/** Demo device metadata — hosts come from VITE_CAMERA_HOSTS or this list */
const demoDevices: Omit<DiscoveredCamera, 'alreadyRegistered' | 'selected'>[] = [
  {
    id: 'disc-68-200',
    host: '192.168.68.200',
    model: 'AXIS P1465-LE',
    serial: 'ACCC8E123456',
    firmware: '11.11.104',
  },
  {
    id: 'disc-68-201',
    host: '192.168.68.201',
    model: 'AXIS M1065-L',
    serial: 'ACCC8E234567',
    firmware: '10.12.89',
  },
  {
    id: 'disc-68-202',
    host: '192.168.68.202',
    model: 'AXIS P3245-LVE',
    serial: 'ACCC8E345678',
    firmware: '11.10.91',
  },
  {
    id: 'disc-68-203',
    host: '192.168.68.203',
    model: 'AXIS P1455-LE',
    serial: 'ACCC8E456789',
    firmware: '11.11.98',
  },
]

function deviceForHost(host: string): Omit<DiscoveredCamera, 'alreadyRegistered' | 'selected'> {
  const known = demoDevices.find((d) => d.host === host)
  if (known) return known
  return {
    id: `disc-${host.replace(/\./g, '-')}`,
    host,
    model: 'AXIS Camera',
    serial: `DISC-${host.replace(/\./g, '')}`,
    firmware: '—',
  }
}

/**
 * Phase 1 mock discovery.
 * Uses VITE_CAMERA_HOSTS from .env when set; otherwise demo IPs on 192.168.68.x.
 */
export function mockNetworkDiscovery(registeredHosts: string[]): DiscoveredCamera[] {
  const envHosts = getEnvCameraHosts()
  const hosts = envHosts.length > 0 ? envHosts : demoDevices.map((d) => d.host)

  return hosts.map((host) => {
    const device = deviceForHost(host)
    const alreadyRegistered = registeredHosts.includes(host)
    return {
      ...device,
      id: `disc-${host.replace(/\./g, '-')}`,
      host,
      alreadyRegistered,
      selected: !alreadyRegistered,
    }
  })
}
