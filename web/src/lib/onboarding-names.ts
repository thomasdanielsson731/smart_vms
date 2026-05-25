import type { DiscoveredCamera, OnboardingBatch } from '@/types/onboarding'

const ERROR_MODEL = /auth failed|credentials missing|unreachable|could not read/i

export function isUsableModelName(model: string): boolean {
  const trimmed = model.trim()
  return trimmed.length > 0 && !ERROR_MODEL.test(trimmed)
}

/** Build display names for selected cameras; dedupes when several share the same model. */
export function buildOnboardCameraNames(
  devices: Pick<DiscoveredCamera, 'host' | 'model' | 'serial'>[],
  batch: Pick<OnboardingBatch, 'namePrefix' | 'nameStrategy'>,
): string[] {
  const used = new Set<string>()
  return devices.map((device) => {
    const ipSuffix = device.host.split('.').pop() ?? device.host
    let base: string

    if (batch.nameStrategy === 'model' && isUsableModelName(device.model)) {
      base = device.model.trim()
    } else {
      base = `${batch.namePrefix} ${ipSuffix}`.trim()
    }

    if (!used.has(base)) {
      used.add(base)
      return base
    }

    const withIp = `${base} (${ipSuffix})`
    if (!used.has(withIp)) {
      used.add(withIp)
      return withIp
    }

    const serialTail = device.serial.replace(/[^a-zA-Z0-9]/g, '').slice(-4)
    const fallback = serialTail ? `${base} (${serialTail})` : `${base} (${device.host})`
    used.add(fallback)
    return fallback
  })
}

export function buildOnboardCameraName(
  device: Pick<DiscoveredCamera, 'host' | 'model' | 'serial'>,
  batch: Pick<OnboardingBatch, 'namePrefix' | 'nameStrategy'>,
  usedNames: Set<string>,
): string {
  const names = buildOnboardCameraNames([device], batch)
  let name = names[0]!
  if (usedNames.has(name)) {
    const ipSuffix = device.host.split('.').pop() ?? device.host
    name = `${name} (${ipSuffix})`
  }
  usedNames.add(name)
  return name
}
