import type { ChatAction } from '@/types/chat'



/** Simple keyword routing — replaced by LLM + tools later */

export function resolveChatIntent(input: string): ChatAction | null {

  const q = input.toLowerCase().trim()



  if (

    /onboard|network|discover|find cameras|search cameras|scan|discovery|ws-discovery|mdns|add all|register cameras|nätverk|natverk|upptäck|upptack|sök kameror|sok kameror|hitta kameror|lägg till alla|registrera kameror/.test(

      q,

    )

  ) {

    return {

      workspace: 'onboarding',

      reply:

        'Opening network onboarding. You can search for Axis cameras on the LAN and onboard multiple with the same VAPIX settings.',

    }

  }



  if (

    /create alarm|new alarm|add alarm|monitoring rule|alarm rule|skapa larm|nytt larm|ny alarm|lägg till larm|bevakningsregel|larmregel/.test(

      q,

    )

  ) {

    return {

      workspace: 'alarms',

      params: { mode: 'create' },

      reply:

        'Opening create alarm. Select one or more cameras — enable bulk for one alarm per camera.',

    }

  }



  if (

    /live|show|play|video|clip|driveway|entry|garden|garage|front|yard|visa|spela|klipp|uppfo?rt|entr|trädgård|fil/.test(

      q,

    ) &&

    !/onboard|alarm|larm/.test(q)

  ) {

    let camera = 'cam-driveway'

    if (/entr|entry/.test(q)) camera = 'cam-entry'

    if (/trädgård|tradgard|garden|yard/.test(q)) camera = 'cam-garden'

    if (/garage/.test(q)) camera = 'cam-garage'

    if (/yesterday|last night|evening|igår|igar|kväll|kval/.test(q)) {

      return {

        workspace: 'video',

        params: { camera, mode: 'playback' },

        reply:

          'Opening the video workspace with playback (mock). When the recording service is connected I will seek to the right segment.',

      }

    }

    return {

      workspace: 'video',

      params: { camera, mode: 'live' },

      reply: 'Opening live view for the camera. Stream connects in Phase 1 (RTSP/WebRTC).',

    }

  }



  if (

    /map|floor plan|place.*camera|cameras.*map|field of view|fov|overview map|karta|kartvy|placera.*kamer|kameror.*karta|bildfält|översiktskarta/.test(

      q,

    )

  ) {

    return {

      workspace: 'map',

      reply: 'Opening map view — place cameras, zoom and adjust view (bearing and field of view).',

    }

  }



  if (

    /forensic|timeline.*alarm|all alarms|review.*recording|evidence|investigation|event timeline|forensisk|tidslinje.*larm|alla larm|granska.*inspel|bevis|utredning|händelsetidslinje/.test(

      q,

    )

  ) {

    return {

      workspace: 'forensic',

      params: { range: '48h' },

      reply: 'Opening forensic — timeline with all alarms and linked recording clips.',

    }

  }



  if (

    /\bface\b|recogni[sz]e|known person|unknown person|face rec|name person|ansikt|igenkän|igenkan|känd person|okänd person|namnge person/.test(

      q,

    )

  ) {

    return {

      workspace: 'faces',

      params: { tab: 'enroll' },

      reply: 'Opening face recognition — select video, scan faces and name people.',

    }

  }



  if (

    /dashboard|statistics|stats|chart|alarm.*week|week.*alarm|statistik|diagram|larm.*vecka|vecka.*larm/.test(

      q,

    )

  ) {

    return {

      workspace: 'dashboard',

      reply: 'Opening dashboard with system and alarm statistics.',

    }

  }



  if (/track|tracking|follow|spår|spårning|följ|folj/.test(q) && !/person|vehicle|fordon/.test(q)) {

    return {

      workspace: 'tracking',

      reply: 'Opening tracking — shows mock tracks across cameras (Phase 2–3).',

    }

  }



  if (/agent|monitor|surveil|list agent|bevaka|övervak|overvak|lista agent/.test(q)) {

    return {

      workspace: 'agents',

      reply: 'Opening your monitoring agents. Create new alarms via Create alarm or the chat.',

    }

  }



  if (
    /camera web|web interface|axis web|open camera page|camera settings page|kamerans webb|webbgränssnitt|kamera webb/.test(
      q,
    )
  ) {
    let camera = 'cam-driveway'
    if (/entry|entrance|entr/.test(q)) camera = 'cam-entry'
    if (/garden|yard|trädgård|tradgard/.test(q)) camera = 'cam-garden'
    if (/garage/.test(q)) camera = 'cam-garage'
    return {
      workspace: 'camera-web',
      params: { camera, path: '/' },
      reply:
        'Opening the camera web UI — each Axis device runs a web server at its IP. Browse setup pages inside Smart VMS or open in a new tab.',
    }
  }



  if (

    /setting|retention|privacy|storage|disk|quota|recording.*location|limit.*storage|inställ|install|lagring|kvot|inspelning.*plats|begränsa.*lagring/.test(

      q,

    )

  ) {

    return {

      workspace: 'settings',

      reply: 'Opening settings — you can set max disk for recordings and clips.',

    }

  }



  if (/create agent|skapa agent/.test(q)) {

    return {

      workspace: 'alarms',

      params: { mode: 'create' },

      reply: 'Opening create alarm — agents and alarms share the same policy engine (mock).',

    }

  }



  return null

}



export const suggestedPrompts = [

  'Onboard all cameras on the network',

  'Create a new alarm for the garage after 22:00',

  'Show live from the driveway',

  'Open the driveway camera web interface',

  'Open dashboard for alarms from the last week',

  'Track a person from driveway to entry',

  'Why did I get an alarm at 23:14?',

  'Limit recording storage to 200 GB',

  'Open forensic and show all alarms from the last 48 hours',

  'Open the map and show the cameras',

  'Show face recognition and unknown visitors',

  'Name a person from video on the driveway',

]

