import { useEffect, useState } from 'react'
import type { RecordingSegment } from '@/types/forensic'
import { fetchRecordingSegments } from '@/lib/recording-api'

export function useRecordingSegments(
  rangeStart: Date,
  rangeEnd: Date,
  cameraIds: string[],
): RecordingSegment[] {
  const [segments, setSegments] = useState<RecordingSegment[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (cameraIds.length === 0) {
        setSegments([])
        return
      }
      const lists = await Promise.all(
        cameraIds.map((id) => fetchRecordingSegments(rangeStart, rangeEnd, id)),
      )
      if (!cancelled) {
        setSegments(lists.flat())
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [rangeStart.getTime(), rangeEnd.getTime(), cameraIds.join(',')])

  return segments
}
