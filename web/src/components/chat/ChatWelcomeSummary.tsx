import { useMemo, useState } from 'react'
import { Bot } from 'lucide-react'
import type { Camera } from '@/types/camera'
import type { FaceProfile, FaceRecognitionSettings } from '@/types/face'
import type { ForensicIncident } from '@/types/forensic'
import {
  ACTIVITY_SUMMARY_PERIODS,
  buildChatActivitySummary,
  type ActivitySummaryPeriodDays,
} from '@/lib/chat-activity-summary'

const PERIOD_STORAGE_KEY = 'smart-vms-chat-summary-period'

function loadStoredPeriod(): ActivitySummaryPeriodDays {
  try {
    const raw = localStorage.getItem(PERIOD_STORAGE_KEY)
    if (raw === '1' || raw === '7' || raw === '30') return Number(raw) as ActivitySummaryPeriodDays
  } catch {
    /* ignore */
  }
  return 1
}

function saveStoredPeriod(days: ActivitySummaryPeriodDays): void {
  try {
    localStorage.setItem(PERIOD_STORAGE_KEY, String(days))
  } catch {
    /* ignore */
  }
}

interface ChatWelcomeSummaryProps {
  displayName: string
  sinceLastLogin: string | null
  incidents: ForensicIncident[]
  cameras: Camera[]
  faceProfiles: FaceProfile[]
  faceSettings: FaceRecognitionSettings
  ollamaNote: string
  onOpenVideo: () => void
}

export function ChatWelcomeSummary({
  displayName,
  sinceLastLogin,
  incidents,
  cameras,
  faceProfiles,
  faceSettings,
  ollamaNote,
  onOpenVideo,
}: ChatWelcomeSummaryProps) {
  const [periodDays, setPeriodDays] = useState<ActivitySummaryPeriodDays>(loadStoredPeriod)

  const summary = useMemo(
    () =>
      buildChatActivitySummary({
        displayName,
        sinceLastLogin,
        periodDays,
        incidents,
        cameras,
        faceProfiles,
        faceSettings,
      }),
    [
      displayName,
      sinceLastLogin,
      periodDays,
      incidents,
      cameras,
      faceProfiles,
      faceSettings,
    ],
  )

  const selectPeriod = (days: ActivitySummaryPeriodDays) => {
    setPeriodDays(days)
    saveStoredPeriod(days)
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/25 text-blue-400">
        <Bot className="h-4 w-4" />
      </div>
      <div className="max-w-[85%]">
        <div className="inline-block rounded-2xl bg-[var(--color-surface-700)] px-4 py-2.5 text-sm leading-relaxed text-slate-200">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {ACTIVITY_SUMMARY_PERIODS.map(({ days, label }) => (
              <button
                key={days}
                type="button"
                onClick={() => selectPeriod(days)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                  periodDays === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
                aria-pressed={periodDays === days}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="whitespace-pre-line">{summary + ollamaNote}</p>
        </div>
        <button
          type="button"
          onClick={onOpenVideo}
          className="mt-2 block text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          Open video timeline →
        </button>
      </div>
    </div>
  )
}
