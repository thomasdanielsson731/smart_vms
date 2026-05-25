import { describe, expect, it } from 'vitest'
import { modelNameMatches, pickVisionModelFromList, parseOllamaErrorMessage } from './vision-model'

describe('pickVisionModelFromList', () => {
  const installed = ['qwen2.5-coder:7b', 'llava:7b', 'moondream:latest']

  it('prefers configured model when installed', () => {
    expect(pickVisionModelFromList(installed, 'moondream')).toBe('moondream:latest')
  })

  it('falls back to any vision-capable model', () => {
    expect(pickVisionModelFromList(['qwen2.5-coder:7b', 'llava:7b'], 'moondream')).toBe('llava:7b')
  })

  it('returns null when no vision model', () => {
    expect(pickVisionModelFromList(['qwen2.5-coder:7b'], 'moondream')).toBeNull()
  })
})

describe('modelNameMatches', () => {
  it('matches tag suffix', () => {
    expect(modelNameMatches(['llava:13b'], 'llava')).toBe('llava:13b')
  })
})

describe('parseOllamaErrorMessage', () => {
  it('parses model not found JSON', () => {
    expect(parseOllamaErrorMessage('{"error":"model \'moondream\' not found"}')).toContain('moondream')
    expect(parseOllamaErrorMessage('{"error":"model \'moondream\' not found"}')).toContain('ollama pull')
  })
})
