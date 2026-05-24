import type { AlarmBestPicture } from '@/types/incident'

export function mockBestPicture(
  occurredAt: string,
  score: number,
  bboxNorm: [number, number, number, number],
): AlarmBestPicture {
  return {
    capturedAt: occurredAt,
    score,
    bboxNorm,
  }
}
