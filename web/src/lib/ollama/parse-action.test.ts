import { describe, expect, it, vi, afterEach } from 'vitest'
import { parseCopilotResponse } from './parse-action'

describe('parseCopilotResponse', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('parses camera-web workspace action', () => {
    const raw =
      'Opening camera web UI.\n@@ACTION@@{"workspace":"camera-web","params":{"camera":"cam-driveway","path":"/"}}'
    const { content, action } = parseCopilotResponse(raw)
    expect(content).toContain('Opening camera web UI')
    expect(action?.workspace).toBe('camera-web')
    expect(action?.params?.camera).toBe('cam-driveway')
  })

  it('ignores unknown workspace ids', () => {
    const raw = 'Done.\n@@ACTION@@{"workspace":"not-real"}'
    expect(parseCopilotResponse(raw).action).toBeNull()
  })

  it('blocks faces workspace when feature flag is off', () => {
    vi.stubEnv('VITE_FACE_RECOGNITION_ENABLED', '')
    const raw = 'Faces.\n@@ACTION@@{"workspace":"faces"}'
    expect(parseCopilotResponse(raw).action).toBeNull()
  })
})
