import { describe, expect, it } from 'vitest'
import {
  aoaErrorMessage,
  isAllowedAoaMethod,
  pickLatestAoaApiVersion,
} from './object-analytics'

describe('object-analytics', () => {
  it('allows read and write methods', () => {
    expect(isAllowedAoaMethod('getConfiguration')).toBe(true)
    expect(isAllowedAoaMethod('setConfiguration')).toBe(true)
    expect(isAllowedAoaMethod('deleteEverything')).toBe(false)
  })

  it('extracts app error messages', () => {
    expect(aoaErrorMessage({ method: 'x', error: { code: 2004, message: 'Invalid parameter' } })).toBe(
      'Invalid parameter',
    )
  })

  it('picks highest supported api version', () => {
    expect(pickLatestAoaApiVersion({ apiVersions: ['1.0', '1.2', '1.1'] })).toBe('1.2')
  })
})
