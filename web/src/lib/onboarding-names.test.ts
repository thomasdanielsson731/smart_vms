import { describe, expect, it } from 'vitest'
import { buildOnboardCameraNames, isUsableModelName } from './onboarding-names'

describe('isUsableModelName', () => {
  it('accepts VAPIX product names', () => {
    expect(isUsableModelName('AXIS P1465-LE')).toBe(true)
    expect(isUsableModelName('P1465-LE')).toBe(true)
  })

  it('rejects probe error placeholders', () => {
    expect(isUsableModelName('VAPIX auth failed — check camera password')).toBe(false)
    expect(isUsableModelName('Unreachable — check IP and VAPIX credentials')).toBe(false)
  })
})

describe('buildOnboardCameraNames', () => {
  const devices = [
    { host: '192.168.1.200', model: 'AXIS P1465-LE', serial: 'ACCC12345678' },
    { host: '192.168.1.201', model: 'AXIS P1465-LE', serial: 'ACCC87654321' },
    { host: '192.168.1.202', model: 'Unreachable — check IP', serial: '—' },
  ]

  it('uses model name by default strategy', () => {
    const names = buildOnboardCameraNames(devices.slice(0, 1), {
      namePrefix: 'Camera',
      nameStrategy: 'model',
    })
    expect(names).toEqual(['AXIS P1465-LE'])
  })

  it('dedupes identical models with IP suffix', () => {
    const names = buildOnboardCameraNames(devices.slice(0, 2), {
      namePrefix: 'Camera',
      nameStrategy: 'model',
    })
    expect(names).toEqual(['AXIS P1465-LE', 'AXIS P1465-LE (201)'])
  })

  it('falls back to prefix-ip when model is unusable', () => {
    const names = buildOnboardCameraNames(devices.slice(2), {
      namePrefix: 'Camera',
      nameStrategy: 'model',
    })
    expect(names).toEqual(['Camera 202'])
  })

  it('uses prefix-ip strategy', () => {
    const names = buildOnboardCameraNames(devices.slice(0, 2), {
      namePrefix: 'Cam',
      nameStrategy: 'prefix-ip',
    })
    expect(names).toEqual(['Cam 200', 'Cam 201'])
  })
})
