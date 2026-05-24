# Axis live video (dev)

**Status:** MJPEG/snapshot via Vite proxy (Phase 1)

## Varför inget syntes tidigare

Live-vyn var en **placeholder**. Nu hämtas bild från Axis via VAPIX:

1. **MJPEG** (`/axis-cgi/mjpg/video.cgi`) — föredras
2. **Snapshot** (~1/s) om MJPEG misslyckas

## Konfiguration

**Rekommenderat:** öppna **Inställningar → Kameror (VAPIX)** i appen och ange gemensamt användarnamn + lösenord för alla kameror.

Alternativt i `web/.env`:

```env
AXIS_VAPIX_USER=root
AXIS_VAPIX_PASSWORD=ditt_lösenord
VITE_CAMERA_STREAM_ENABLED=true
```

Inställningar i UI sparas i `.vapix.credentials.json` (gitignored) och har företräde framför `.env`.

2. Uppdatera **IP-adresser** i `web/src/lib/mock-data.ts` till dina riktiga Axis-kameror (fält `host`).

3. Starta med **`npm run dev`** (inte statisk `dist/` — proxyn körs i dev-servern).

4. Öppna **Video → Live** eller be Copilot: «Visa live från uppfarten».

## Krav

- **Inloggad session** — live video och Copilot kräver giltig cookie ([authentication.md](authentication.md))
- Datorn med webbläsaren på **samma LAN** som kamerorna
- VAPIX-användare med rätt att läsa video
- Digest auth (hanteras av proxyn)

## Stäng av live

```env
VITE_CAMERA_STREAM_ENABLED=false
```

## Produktion

Proxyn i Vite är för utveckling. Produktion: backend eller go2rtc/MediaMTX (ADR).
