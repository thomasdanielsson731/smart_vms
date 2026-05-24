/** Mock-detekterade ansikten i en bildruta (normaliserad bbox) */
export interface DetectedFaceBox {
  id: string
  bboxNorm: [number, number, number, number]
  /** Mock-poäng att det är ett ansikte */
  detectScore: number
}

const presets: DetectedFaceBox[][] = [
  [
    { id: 'f1', bboxNorm: [0.38, 0.28, 0.14, 0.22], detectScore: 0.94 },
  ],
  [
    { id: 'f1', bboxNorm: [0.22, 0.35, 0.12, 0.18], detectScore: 0.91 },
    { id: 'f2', bboxNorm: [0.58, 0.32, 0.11, 0.19], detectScore: 0.87 },
  ],
  [
    { id: 'f1', bboxNorm: [0.45, 0.4, 0.13, 0.21], detectScore: 0.89 },
  ],
]

export function mockDetectedFaces(seed: number): DetectedFaceBox[] {
  return presets[Math.abs(seed) % presets.length].map((f) => ({ ...f, id: `${f.id}-${seed}` }))
}

export const profileColors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4']
