# Authentication (Phase 1)

**Status:** Implemented in dev/preview server middleware (Phase 1)

Smart VMS kräver inloggning innan UI, live video, Copilot (Ollama) och kameraproxy används.

## Modell

| Del | Beskrivning |
|-----|-------------|
| **Konton** | Lokala användare i `web/.env` (Phase 1); databas i Phase 2 |
| **Session** | HMAC-signerad cookie `smartvms_session`, `HttpOnly`, `SameSite=Strict` |
| **Roller** | `admin` — full åtkomst · `viewer` — läsbehörighet |
| **API-skydd** | Alla `/api/*` utom login/status kräver giltig session |

## Konfiguration

Kopiera och fyll i `web/.env`:

```env
SMARTVMS_SESSION_SECRET=<openssl rand -hex 32>
SMARTVMS_ADMIN_USER=admin
SMARTVMS_ADMIN_PASSWORD=<starkt lösenord>
SMARTVMS_VIEWER_USER=familj          # valfritt
SMARTVMS_VIEWER_PASSWORD=<...>       # valfritt
SMARTVMS_SESSION_TTL_HOURS=8
SMARTVMS_COOKIE_SECURE=false         # true bakom HTTPS
```

Starta om **`npm run dev`** efter ändringar i `.env`.

## Behörigheter

| Workspace / funktion | admin | viewer |
|----------------------|:-----:|:------:|
| Video, dashboard, forensic, karta | ✓ | ✓ |
| Copilot (Ollama) | ✓ | ✓ |
| Onboarding kameror | ✓ | ✗ |
| Skapa larm | ✓ | ✗ |
| Ändra lagringsinställningar | ✓ | ✗ |
| Inställningar (visa konto) | ✓ | ✓ |

## API-endpoints

| Metod | Sökväg | Auth | Syfte |
|-------|--------|------|-------|
| POST | `/api/auth/login` | Nej | Logga in, sätter cookie |
| POST | `/api/auth/logout` | Nej* | Rensa session |
| GET | `/api/auth/me` | Cookie | Aktuell användare |
| GET | `/api/auth/status` | Nej | Om lösenord är konfigurerat |
| * | `/api/camera/*` | Cookie | Live MJPEG/snapshot |
| * | `/api/ollama/*` | Cookie | Copilot |

\* Logout fungerar utan inloggning (rensar cookie).

## Säkerhetsdetaljer

- **Timing-safe** jämförelse av lösenord
- **Rate limit:** max 5 misslyckade inloggningar per IP / 15 min
- **Security headers:** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`
- **Kameruppgifter:** krypterade server-side (AES-256-GCM), aldrig i localStorage — se [cyber-resilience-act.md](cyber-resilience-act.md)
- **Audit log:** `.smartvms-audit.log` (inloggning, sparade kameruppgifter)
- **Kameraproxy:** endast privata IP (10/8, 192.168/16, 172.16–31, 127.0.0.1)
- **VAPIX-lösenord** läses aldrig av klienten — endast server-side proxy

## Begränsningar (Phase 1)

- Konton i miljövariabler, inte användarhantering i UI
- Session hemlighet genereras tillfälligt vid omstart om `SMARTVMS_SESSION_SECRET` saknas (dev-varning)
- Auth middleware körs i Vite dev/preview — **inte** i statisk `dist/` utan backend
- Produktion: samma logik flyttas till API gateway (se [architecture overview](../architecture/overview.md))

## Relaterat

- [security-and-privacy.md](security-and-privacy.md) — hotmodell
- [axis-live-stream.md](axis-live-stream.md) — live video bakom auth
