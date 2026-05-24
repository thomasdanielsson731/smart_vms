import { describe, expect, it, vi, afterEach } from 'vitest'
import { parseCopilotResponse } from './parse-action'

describe('parseCopilotResponse — normal cases', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('returns content only when no action tag present', () => {
    const { content, action } = parseCopilotResponse('Hello, how can I help?')
    expect(content).toBe('Hello, how can I help?')
    expect(action).toBeNull()
  })

  it.each([
    ['video', { camera: 'cam-driveway', t: '100' }],
    ['onboarding', undefined],
    ['dashboard', undefined],
    ['map', undefined],
    ['settings', undefined],
    ['forensic', { range: '48h', t: '50' }],
    ['camera-web', { camera: 'cam-entry', path: '/' }],
  ] as const)('parses %s workspace action', (workspace, params) => {
    const paramsJson = params ? `,"params":${JSON.stringify(params)}` : ''
    const raw = `Opening view.\n@@ACTION@@{"workspace":"${workspace}"${paramsJson}}`
    const { action } = parseCopilotResponse(raw)
    expect(action?.workspace).toBe(workspace)
    if (params) expect(action?.params).toEqual(params)
  })

  it('strips action tag from displayed content', () => {
    const raw = 'Done.\n@@ACTION@@{"workspace":"video","params":{"t":"100"}}'
    expect(parseCopilotResponse(raw).content).toBe('Done.')
  })
})

describe('parseCopilotResponse — rejection cases', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('ignores unknown workspace ids', () => {
    expect(parseCopilotResponse('Done.\n@@ACTION@@{"workspace":"not-real"}').action).toBeNull()
  })

  it('ignores malformed JSON', () => {
    expect(parseCopilotResponse('Done.\n@@ACTION@@{broken').action).toBeNull()
  })

  it('blocks faces workspace when feature flag is off', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', '')
    expect(parseCopilotResponse('Faces.\n@@ACTION@@{"workspace":"faces"}').action).toBeNull()
  })

  it('allows faces workspace when feature flag is on', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', 'true')
    expect(parseCopilotResponse('Faces.\n@@ACTION@@{"workspace":"faces"}').action?.workspace).toBe(
      'faces',
    )
  })
})
