import type { FaceProfile, FaceRecognitionSettings } from '@/types/face'

import { faceRoleLabels } from '@/types/face'

import type { Incident } from '@/types/incident'

import type {

  AlarmTier2Analysis,

  Tier2AssessedPriority,

  Tier2PersonInsight,

  Tier2SubjectType,

} from '@/types/alarm-analytics'



export interface Tier2Context {

  faceProfiles: FaceProfile[]

  faceSettings: FaceRecognitionSettings

}



function inferSubjectType(incident: Incident): Tier2SubjectType {

  const text = `${incident.title} ${incident.ruleName ?? ''}`.toLowerCase()

  if (/fordon|vehicle|bil/.test(text)) return 'vehicle'

  if (/paket|objekt|package/.test(text)) return 'object'

  if (/person|intrång|besök|intrusion|visitor/.test(text)) return 'person'

  if (/vapix|rörelse|motion/.test(text)) return 'motion'

  return 'unknown'

}



function formatConfidence(confidence?: number): string {

  if (confidence == null) return ''

  return `${Math.round(confidence * 100)}%`

}



function buildPersonInsights(

  incident: Incident,

  ctx: Tier2Context,

): Tier2PersonInsight[] {

  const { faceProfiles, faceSettings } = ctx

  const persons: Tier2PersonInsight[] = []



  if (incident.faceMatch) {

    const match = incident.faceMatch

    const profile = match.profileId

      ? faceProfiles.find((p) => p.id === match.profileId)

      : undefined

    const rememberedOnCamera = profile

      ? profile.rememberedByCameras.includes(incident.cameraId)

      : false



    if (match.unknown) {

      persons.push({

        kind: 'unknown',

        name: match.displayName,

        confidence: match.confidence,

        notes: faceSettings.alertOnUnknown

          ? 'Unknown person — alarm per face settings'

          : 'Unknown person — face recognition active',

      })

    } else {

      persons.push({

        kind: 'known',

        name: match.displayName,

        profileId: match.profileId,

        role: profile?.role,

        confidence: match.confidence,

        rememberedOnCamera,

        notes: rememberedOnCamera

          ? `Camera ${incident.cameraName} recognises this person`

          : profile

            ? 'Profile exists but the camera has not saved memory yet'

            : undefined,

      })

    }

    return persons

  }



  const subject = inferSubjectType(incident)

  if (subject === 'person' && faceSettings.enabled) {

    persons.push({

      kind: 'inferred',

      name: 'Person (not identified)',

      notes: 'Detection suggests a person but no face was matched',

    })

  } else if (subject === 'person') {

    persons.push({

      kind: 'inferred',

      name: 'Person',

      notes: 'Person detected — face recognition is disabled',

    })

  }



  return persons

}



function assessPriority(

  incident: Incident,

  persons: Tier2PersonInsight[],

): Tier2AssessedPriority {

  const hasUnknown = persons.some((p) => p.kind === 'unknown')

  const isNightRule = /natt|night|tyst|quiet/.test(

    `${incident.ruleName ?? ''} ${incident.title}`.toLowerCase(),

  )



  if (incident.severity === 'high' || (hasUnknown && isNightRule)) return 'urgent'

  if (hasUnknown || incident.severity === 'medium') return 'review'

  return 'routine'

}



function buildSources(incident: Incident, ctx: Tier2Context): AlarmTier2Analysis['sources'] {

  const sources: AlarmTier2Analysis['sources'] = ['rule']

  const subject = inferSubjectType(incident)

  if (subject !== 'motion' && subject !== 'unknown') sources.push('object_detection')

  if (/vapix/i.test(incident.title) || incident.ruleName === 'Axis motion') {

    sources.push('vapix')

  }

  if (ctx.faceSettings.enabled && (incident.faceMatch || subject === 'person')) {

    sources.push('face_recognition')

  }

  return sources

}



function buildTriggerExplanation(incident: Incident): string {

  const rule = incident.ruleName ?? 'unknown rule'

  const conf = formatConfidence(incident.confidence)

  if (conf) {

    return `Rule «${rule}» on ${incident.cameraName} triggered with ${conf} confidence.`

  }

  return `Rule «${rule}» on ${incident.cameraName} triggered.`

}



function buildHeadline(

  incident: Incident,

  subject: Tier2SubjectType,

  persons: Tier2PersonInsight[],

): string {

  const known = persons.find((p) => p.kind === 'known')

  const unknown = persons.find((p) => p.kind === 'unknown')



  if (known) {

    const role = known.role ? faceRoleLabels[known.role].toLowerCase() : 'known person'

    return `${known.name} (${role}) at ${incident.cameraName}`

  }

  if (unknown) return `Unknown person at ${incident.cameraName}`

  if (subject === 'vehicle') return `Vehicle detected at ${incident.cameraName}`

  if (subject === 'object') return `Object in frame at ${incident.cameraName}`

  if (subject === 'motion') return `Motion at ${incident.cameraName}`

  return incident.title

}



function buildSummary(

  incident: Incident,

  subject: Tier2SubjectType,

  persons: Tier2PersonInsight[],

  priority: Tier2AssessedPriority,

): string {

  const parts: string[] = []

  const timePhrase = 'The alarm occurred according to the camera timestamp.'



  if (persons.length === 0) {

    if (subject === 'vehicle') {

      parts.push(

        `A vehicle was recorded by ${incident.cameraName}. ${timePhrase} No person is linked to the event.`,

      )

    } else if (subject === 'object') {

      parts.push(

        `An object was detected in the monitoring zone on ${incident.cameraName}. ${timePhrase}`,

      )

    } else if (subject === 'motion') {

      parts.push(

        `General motion or a VAPIX event was reported from ${incident.cameraName}. ${timePhrase} Second tier has not yet classified the subject.`,

      )

    } else {

      parts.push(`${incident.title}. ${timePhrase}`)

    }

  } else {

    const personDesc = persons

      .map((p) => {

        if (p.kind === 'known' && p.role) {

          return `${p.name} (${faceRoleLabels[p.role].toLowerCase()})`

        }

        return p.name

      })

      .join(' and ')



    parts.push(

      `${personDesc} ${persons.length === 1 ? 'appears' : 'appear'} in frame from ${incident.cameraName}. ${timePhrase}`,

    )



    const unknown = persons.find((p) => p.kind === 'unknown')

    if (unknown) {

      parts.push(

        'The person does not match any saved profile — consider reviewing clips and naming if needed.',

      )

    }

    const known = persons.find((p) => p.kind === 'known' && p.rememberedOnCamera)

    if (known) {

      parts.push(`The camera has previously learned to recognise ${known.name} at this location.`)

    }

  }



  if (priority === 'urgent') {

    parts.push('Analysis suggests this event should be prioritised.')

  } else if (priority === 'routine' && subject === 'vehicle') {

    parts.push('Likely routine vehicle traffic based on rule and severity.')

  }



  return parts.join(' ')

}



function buildInsights(

  incident: Incident,

  subject: Tier2SubjectType,

  persons: Tier2PersonInsight[],

  ctx: Tier2Context,

): string[] {

  const insights: string[] = []



  if (incident.confidence != null) {

    insights.push(`Detection confidence: ${formatConfidence(incident.confidence)}`)

  }

  if (incident.bestPicture) {

    insights.push(

      `Best picture selected with score ${Math.round(incident.bestPicture.score * 100)}%`,

    )

  }



  for (const p of persons) {

    if (p.kind === 'unknown') {

      insights.push('Unknown person — check if a visit or delivery was expected')

    }

    if (p.kind === 'known' && p.role === 'service') {

      insights.push('Known delivery/service person — often a harmless routine event')

    }

    if (p.kind === 'known' && p.role === 'household') {

      insights.push('Household member — may be expected presence')

    }

    if (p.confidence != null && p.kind !== 'none') {

      insights.push(`Face match: ${p.name} (${formatConfidence(p.confidence)})`)

    }

  }



  if (subject === 'person' && !ctx.faceSettings.enabled) {

    insights.push('Enable face recognition for naming on future alarms')

  }



  if (incident.status === 'open') {

    insights.push('Alarm is still open — requires operator action')

  }



  return insights.slice(0, 5)

}



/** Generate second-tier analysis for an alarm (mock/rule-based; edge/LLM later) */

export function generateAlarmTier2Analysis(

  incident: Incident,

  ctx: Tier2Context,

): AlarmTier2Analysis {

  const subject = inferSubjectType(incident)

  const persons = buildPersonInsights(incident, ctx)

  const assessedPriority = assessPriority(incident, persons)

  const sources = buildSources(incident, ctx)

  const triggerExplanation = buildTriggerExplanation(incident)



  return {

    incidentId: incident.id,

    generatedAt: new Date().toISOString(),

    headline: buildHeadline(incident, subject, persons),

    summary: buildSummary(incident, subject, persons, assessedPriority),

    triggerExplanation,

    subjectType: subject,

    persons,

    insights: buildInsights(incident, subject, persons, ctx),

    assessedPriority,

    sources,

  }

}



/** High-severity alarms or tier-2 urgent/review — worth surfacing in Smart Chat summary. */
export function isNotableIncident(incident: Incident, ctx: Tier2Context): boolean {
  if (incident.severity === 'high') return true
  const { assessedPriority } = generateAlarmTier2Analysis(incident, ctx)
  return assessedPriority === 'urgent' || assessedPriority === 'review'
}

