import { useMemo, useState } from 'react'
import { ImageOff } from 'lucide-react'
import type { Incident } from '@/types/incident'
import {
  formatBestPictureScore,
  placeholderGradient,
  resolveAlarmImageSrc,
} from '@/lib/alarm-images'

export type AlarmThumbnailSize = 'sm' | 'md' | 'lg'

const sizeClass: Record<AlarmThumbnailSize, string> = {
  sm: 'h-10 w-[4.5rem]',
  md: 'h-14 w-24',
  lg: 'aspect-video w-full',
}

interface AlarmThumbnailProps {
  incident: Incident
  cameraHost?: string
  size?: AlarmThumbnailSize
  showLabel?: boolean
  showBbox?: boolean
  className?: string
}

export function AlarmThumbnail({
  incident,
  cameraHost,
  size = 'md',
  showLabel = false,
  showBbox = true,
  className = '',
}: AlarmThumbnailProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const src = useMemo(
    () => resolveAlarmImageSrc(incident, cameraHost),
    [incident, cameraHost],
  )
  const bbox = incident.bestPicture?.bboxNorm
  const scoreLabel = formatBestPictureScore(incident)
  const usePlaceholder = !src || imgFailed

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-md border border-slate-700/80 bg-slate-900 ${sizeClass[size]} ${className}`}
    >
      {usePlaceholder ? (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: placeholderGradient(incident.id) }}
        >
          <ImageOff className="h-4 w-4 text-white/30" />
        </div>
      ) : (
        <img
          src={src!}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      )}

      {showBbox && bbox && (
        <div
          className="pointer-events-none absolute border-2 border-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
          style={{
            left: `${bbox[0] * 100}%`,
            top: `${bbox[1] * 100}%`,
            width: `${bbox[2] * 100}%`,
            height: `${bbox[3] * 100}%`,
          }}
        />
      )}

      {showLabel && scoreLabel && (
        <span className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 text-center text-[9px] font-medium text-amber-200">
          Best {scoreLabel}
        </span>
      )}
    </div>
  )
}

/** Större best-picture-vy med metadata */
export function AlarmBestPicturePanel({
  incident,
  cameraHost,
}: {
  incident: Incident
  cameraHost?: string
}) {
  const score = formatBestPictureScore(incident)
  const captured = incident.bestPicture?.capturedAt ?? incident.occurredAt

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Best picture</span>
        {score && <span className="text-amber-400/90">Score {score}</span>}
      </div>
      <AlarmThumbnail
        incident={incident}
        cameraHost={cameraHost}
        size="lg"
        showLabel
        showBbox
      />
      <p className="text-xs text-slate-600">
        Captured {new Date(captured).toLocaleString('en-US')}
        {incident.bestPicture?.bboxNorm && ' · bbox highlighted'}
      </p>
    </div>
  )
}
