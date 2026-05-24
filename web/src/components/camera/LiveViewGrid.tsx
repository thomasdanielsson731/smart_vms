import type { Camera } from '@/types/camera'
import { LiveStream } from '@/components/camera/LiveStream'

export function LiveViewGrid({ cameras }: { cameras: Camera[] }) {
  if (cameras.length === 0) {
    return (
      <p className="rounded-xl border border-slate-800/80 bg-slate-900/40 px-4 py-8 text-center text-sm text-slate-500">
        No cameras configured. Add cameras via onboarding or Settings.
      </p>
    )
  }

  return (
    <div
      className={`grid gap-3 ${
        cameras.length === 1
          ? 'grid-cols-1'
          : cameras.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
      }`}
    >
      {cameras.map((camera) => (
        <article
          key={camera.id}
          className="overflow-hidden rounded-xl border border-slate-800/80 bg-[var(--color-surface-800)]"
        >
          <LiveStream camera={camera} />
          <p className="truncate border-t border-slate-800/80 px-3 py-2 text-xs text-slate-500">
            {camera.model !== '—' ? camera.model : 'Axis device'} · {camera.host}
          </p>
        </article>
      ))}
    </div>
  )
}
