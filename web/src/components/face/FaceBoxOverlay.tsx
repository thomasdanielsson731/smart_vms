import type { DetectedFaceWithMemory } from '@/lib/face-memory'

export function FaceBoxOverlay({
  faces,
  selectedId,
  onSelect,
}: {
  faces: DetectedFaceWithMemory[]
  selectedId: string | null
  onSelect: (face: DetectedFaceWithMemory) => void
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {faces.map((face) => {
        const [x, y, w, h] = face.bboxNorm
        const selected = face.id === selectedId
        const known = !face.unknown && face.matchedName
        return (
          <button
            key={face.id}
            type="button"
            onClick={() => onSelect(face)}
            className={`pointer-events-auto absolute border-2 transition ${
              selected
                ? 'border-emerald-400 bg-emerald-400/15 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]'
                : known
                  ? 'border-emerald-500/90 bg-emerald-500/10 hover:border-emerald-400'
                  : 'border-amber-400/80 bg-amber-400/10 hover:border-amber-300 hover:bg-amber-400/20'
            }`}
            style={{
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              width: `${w * 100}%`,
              height: `${h * 100}%`,
            }}
            title={
              known
                ? `${face.matchedName} — camera remembers (${Math.round(face.detectScore * 100)} %)`
                : `Unknown face ${Math.round(face.detectScore * 100)} %`
            }
          >
            {known && (
              <span className="absolute -top-6 left-0 max-w-[120px] truncate rounded bg-emerald-600/95 px-1.5 py-0.5 text-[10px] font-medium text-white shadow">
                {face.matchedName}
              </span>
            )}
            {!known && (
              <span className="absolute -top-6 left-0 rounded bg-amber-600/95 px-1.5 py-0.5 text-[10px] font-medium text-white shadow">
                Unknown
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
