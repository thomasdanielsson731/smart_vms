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
    ['agents', { mode: 'create' }],
    ['config', { tab: 'onboard' }],
    ['dashboard', undefined],
    ['map', undefined],
    ['settings', undefined],
    ['camera-web', { camera: 'cam-entry', path: '/' }],
  ] as const)('parses %s workspace action', (workspace, params) => {
    const paramsJson = params ? `,"params":${JSON.stringify(params)}` : ''
    const raw = `Opening view.\n@@ACTION@@{"workspace":"${workspace}"${paramsJson}}`
    const { action } = parseCopilotResponse(raw)
    expect(action?.workspace).toBe(workspace)
    if (params) expect(action?.params).toEqual(params)
  })

  it('maps legacy forensic workspace to video', () => {
    const raw = 'Opening.\n@@ACTION@@{"workspace":"forensic","params":{"range":"48h","t":"50"}}'
    const { action } = parseCopilotResponse(raw)
    expect(action?.workspace).toBe('video')
    expect(action?.params).toEqual({ range: '48h', t: '50' })
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

  it('maps legacy alarms workspace to agents', () => {
    const raw = 'Done.\n@@ACTION@@{"workspace":"alarms","params":{"mode":"create"}}'
    expect(parseCopilotResponse(raw).action?.workspace).toBe('agents')
    expect(parseCopilotResponse(raw).action?.params?.mode).toBe('create')
  })
})
