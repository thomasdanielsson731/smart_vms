import type { DiscoveredCamera } from '@/types/onboarding'

/** Simulerade enheter på LAN — inkl. redan registrerade + nya */
export function mockNetworkDiscovery(registeredHosts: string[]): DiscoveredCamera[] {
  const devices: Omit<DiscoveredCamera, 'alreadyRegistered' | 'selected'>[] = [
    {
      id: 'disc-51',
      host: '192.168.1.51',
      model: 'AXIS P1465-LE',
      serial: 'ACCC8E123456',
      firmware: '11.11.104',
    },
    {
      id: 'disc-52',
      host: '192.168.1.52',
      model: 'AXIS M1065-L',
      serial: 'ACCC8E234567',
      firmware: '10.12.89',
    },
    {
      id: 'disc-53',
      host: '192.168.1.53',
      model: 'AXIS P3245-LVE',
      serial: 'ACCC8E345678',
      firmware: '11.10.91',
    },
    {
      id: 'disc-54',
      host: '192.168.1.54',
      model: 'AXIS P1455-LE',
      serial: 'ACCC8E456789',
      firmware: '11.11.98',
    },
    {
      id: 'disc-55',
      host: '192.168.1.55',
      model: 'AXIS P3265-LVE',
      serial: 'ACCC8E567890',
      firmware: '11.11.100',
    },
    {
      id: 'disc-56',
      host: '192.168.1.56',
      model: 'AXIS M4318-PLVE',
      serial: 'ACCC8E678901',
      firmware: '11.9.72',
    },
  ]

  return devices.map((d) => {
    const alreadyRegistered = registeredHosts.includes(d.host)
    return {
      ...d,
      alreadyRegistered,
      selected: !alreadyRegistered,
    }
  })
}
