import { describe, expect, it } from 'vitest'
import { resolveChatIntent } from './chat-intents'

describe('resolveChatIntent', () => {
  it('routes onboarding requests', () => {
    expect(resolveChatIntent('discover cameras on the network')?.workspace).toBe('onboarding')
  })

  it('routes alarm creation', () => {
    expect(resolveChatIntent('create a new alarm for garage')?.workspace).toBe('alarms')
  })

  it('routes live video with camera hint', () => {
    const action = resolveChatIntent('show live video from entry')
    expect(action?.workspace).toBe('video')
    expect(action?.params?.camera).toBe('cam-entry')
    expect(action?.params?.mode).toBe('live')
  })

  it('routes playback when time hint is present', () => {
    const action = resolveChatIntent('play driveway clip from yesterday')
    expect(action?.params?.mode).toBe('playback')
  })

  it('routes forensic workspace', () => {
    expect(resolveChatIntent('open forensic timeline')?.workspace).toBe('forensic')
  })

  it('routes face recognition workspace', () => {
    expect(resolveChatIntent('open face recognition')?.workspace).toBe('faces')
  })

  it('routes face recognition without matching "interface"', () => {
    expect(resolveChatIntent('open face recognition')?.workspace).toBe('faces')
  })

  it('does not route "interface" to face recognition', () => {
    expect(resolveChatIntent('open camera web interface')?.workspace).toBe('camera-web')
  })

  it('returns null for unrelated input', () => {
    expect(resolveChatIntent('what is the weather today')).toBeNull()
  })
})
