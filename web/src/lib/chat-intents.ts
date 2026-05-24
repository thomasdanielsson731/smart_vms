import type { ChatAction } from '@/types/chat'

/** Enkel nyckelordsrouting — ersätts av LLM + tools senare */
export function resolveChatIntent(input: string): ChatAction | null {
  const q = input.toLowerCase().trim()

  if (
    /onboard|nätverk|natverk|upptäck|upptack|sök kameror|sok kameror|hitta kameror|scan|discovery|ws-discovery|mdns|lägg till alla|registrera kameror/.test(
      q,
    )
  ) {
    return {
      workspace: 'onboarding',
      reply:
        'Öppnar nätverks-onboarding. Du kan söka Axis-kameror på LAN och onboarda flera med samma VAPIX-inställningar.',
    }
  }

  if (
    /skapa larm|nytt larm|ny alarm|nytt alarm|lägg till larm|bevakningsregel|larmregel/.test(q)
  ) {
    return {
      workspace: 'alarms',
      params: { mode: 'create' },
      reply:
        'Öppnar skapa larm. Välj en eller flera kameror — aktivera bulk för ett larm per kamera.',
    }
  }

  if (
    /live|visa|spela|video|klipp|uppfo?rt|entr|trädgård|garage|fil/.test(q) &&
    !/onboard|larm/.test(q)
  ) {
    let camera = 'cam-driveway'
    if (/entr/.test(q)) camera = 'cam-entry'
    if (/trädgård|tradgard/.test(q)) camera = 'cam-garden'
    if (/garage/.test(q)) camera = 'cam-garage'
    if (/igår|igar|kväll|kval/.test(q)) {
      return {
        workspace: 'video',
        params: { camera, mode: 'playback' },
        reply:
          'Öppnar videoytan med uppspelning (mock). När inspelningstjänsten är kopplad seekar jag till rätt segment.',
      }
    }
    return {
      workspace: 'video',
      params: { camera, mode: 'live' },
      reply: 'Öppnar livevy för kameran. Ström kopplas i Phase 1 (RTSP/WebRTC).',
    }
  }

  if (/karta|kartvy|placera.*kamer|kameror.*karta|bildfält|fov|översiktskarta/.test(q)) {
    return {
      workspace: 'map',
      reply: 'Öppnar kartvy — placera kameror, zooma och justera vy (bäring och bildvinkel).',
    }
  }

  if (
    /forensic|forensisk|tidslinje.*larm|alla larm|granska.*inspel|bevis|utredning|händelsetidslinje/.test(
      q,
    )
  ) {
    return {
      workspace: 'forensic',
      params: { range: '48h' },
      reply: 'Öppnar forensic — tidslinje med alla larm och kopplade inspelningsklipp.',
    }
  }

  if (/dashboard|statistik|stats|diagram|larm.*vecka|vecka.*larm/.test(q)) {
    return {
      workspace: 'dashboard',
      reply: 'Öppnar dashboard med system- och larmstatistik.',
    }
  }

  if (/spår|tracking|följ|folj|spårning/.test(q) && !/person|fordon/.test(q)) {
    return {
      workspace: 'tracking',
      reply: 'Öppnar spårning — visar mock-spår över kameror (Phase 2–3).',
    }
  }

  if (/agent|bevaka|övervak|overvak|lista agent/.test(q)) {
    return {
      workspace: 'agents',
      reply: 'Öppnar dina övervakningsagenter. Skapa nya larm via «Skapa larm» eller chatten.',
    }
  }

  if (
    /inställ|install|retention|integritet|lagring|disk|kvot|inspelning.*plats|begränsa.*lagring|storage/.test(
      q,
    )
  ) {
    return {
      workspace: 'settings',
      reply: 'Öppnar inställningar — du kan sätta max disk för inspelningar och klipp.',
    }
  }

  if (/skapa agent/.test(q)) {
    return {
      workspace: 'alarms',
      params: { mode: 'create' },
      reply: 'Öppnar skapa larm — agenter och larm delar samma policymotor (mock).',
    }
  }

  return null
}

export const suggestedPrompts = [
  'Onboarda alla kameror i nätverket',
  'Skapa nytt larm för garage efter 22',
  'Visa live från uppfarten',
  'Öppna dashboard för larm senaste veckan',
  'Spåra person från uppfart till entré',
  'Varför fick jag larm kl 23:14?',
  'Begränsa lagring för inspelningar till 200 GB',
  'Öppna forensic och visa alla larm senaste 48 timmarna',
  'Öppna kartan och visa kamerorna',
]
