# Multi-konfiguration (UI)

**Status:** Proposed — mock i `web/`

## Onboarding (bulk)

1. Sök nätverket (mDNS/ONVIF — mock)
2. Välj en eller flera enheter («Endast nya» för bulk)
3. Gemensam VAPIX-användare, lösenord, namnprefix, inspelning
4. Onboarda alla valda

Backend Phase 1: `POST /discovery/scan`, `POST /cameras/bulk`

## Larm (bulk)

- Ett larm med flera kameror, eller
- «Ett separat larm per kamera» för samma regel

Backend Phase 2: `POST /alarms`, `POST /alarms/bulk`

## State

Klient: `AppConfigContext` (ersätts av API + ev. React Query).
