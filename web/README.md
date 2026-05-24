# Smart VMS — Web UI

**AI-first:** huvudgränssnittet är en **chatt (Copilot)**. Video, dashboard, spårning och övervakningsagenter öppnas som **workspace-paneler** bredvid chatten.

## Köra lokalt

```bash
cd web
npm install
cp .env.example .env   # sätt SMARTVMS_ADMIN_PASSWORD m.m.
npm run dev
```

http://localhost:5173 — **logga in** med admin-kontot från `.env`.

Se [docs/engineering/authentication.md](../docs/engineering/authentication.md) för roller och session.

## Upplevelse

```text
[ikonrail] | CHAT (alltid) | WORKSPACE (vid behov)
           | Copilot       | Video / Dashboard / Tracking / Agents
```

**Exempel i chatten:**

- «Visa live från uppfarten» → videopanel
- «Öppna dashboard för larm senaste veckan» → statistik
- «Spåra person från uppfart till entré» → spårning
- «Onboarda alla kameror i nätverket» → onboarding-wizard
- «Skapa nytt larm för garage efter 22» → larmformulär (bulk möjligt)
- «Varför fick jag larm kl 23:14?» → förklaring + klipp

**Copilot** använder **Ollama** lokalt (standard: `qwen2.5-coder:7b`). Se [docs/engineering/ollama-copilot.md](../docs/engineering/ollama-copilot.md).

```bash
# Krävs en gång
ollama serve   # eller Ollama-appen
ollama pull qwen2.5-coder:7b

cd web
cp .env.example .env   # om .env saknas
npm run dev
```

Om Ollama är nere används enkel intent-matchning som reserv.

## Live video (Axis)

Kräver `AXIS_VAPIX_USER` / `AXIS_VAPIX_PASSWORD` i `web/.env` och riktiga IP i mock-data.  
Se [docs/engineering/axis-live-stream.md](../docs/engineering/axis-live-stream.md).  
Kör **`npm run dev`** — live fungerar inte utan dev-proxy.

## Ikonrail (snabb åtkomst)

| Ikon | Workspace |
|------|-------------|
| Radar | **Onboarding** — sök & bulk-registrera kameror |
| Klocka+ | **Skapa larm** — en eller flera kameror (bulk) |
| Karta | **Kartvy** — placera kameror + bildfält (FOV) |
| Förstoringsglas | **Forensic** — tidslinje med alla larm + klipp |
| Video | Live / uppspelning |
| Dashboard | Larm & systemstatistik |
| Spårning | Objekt över kameror |
| Agenter | Lista aktiva larm |

## Stack

React 19 · TypeScript · Vite · React Router · Tailwind v4 · Lucide

## Dokumentation

- [docs/product/ux-ai-first.md](../docs/product/ux-ai-first.md)

## Nästa steg

1. Backend chat API + tool calling (open video, query incidents)
2. Ersätt mock-intent med riktig modell
3. Agent builder (skapa/redigera monitoring agents)
4. WebRTC/HLS i videoworkspace
