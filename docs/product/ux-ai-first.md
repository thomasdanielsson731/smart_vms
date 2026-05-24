# UX — AI-first operator experience

**Status:** Proposed — UI shell in `web/`

## North star

The **primary interface is a conversational agent**, not a traditional VMS menu tree. The operator describes intent in natural language (Swedish or English); the system opens the right **workspace surface** (video, statistics, tracking, monitoring agents) alongside or after the reply.

Traditional VMS functions remain available — they are **opened by the agent**, not hidden.

## Layout

```text
┌────────────────────────────────────────────────────────┐
│  Smart VMS · Copilot                                   │
├─────────────────────┬──────────────────────────────────┤
│  CHAT (default)     │  WORKSPACE (on demand)           │
│  · thread           │  · Video (live / clip / fil)     │
│  · quick actions    │  · Dashboard (statistik)         │
│  · tool cards       │  · Tracking (objekt / spår)      │
│                     │  · Agents (övervakning / larm)   │
└─────────────────────┴──────────────────────────────────┘
```

- Chat is **always visible** when a workspace is open (split view).
- With no workspace, chat uses **full width**.
- Deep links: `/w/video?camera=…`, `/w/dashboard`, etc.

## Chat capabilities (target)

| Intent class | Example (SV) | Workspace |
|--------------|--------------|-----------|
| **Onboarding (bulk)** | "Onboarda alla kameror i nätverket" | Onboarding |
| **Create alarm (bulk)** | "Skapa nytt larm för garage efter 22" | Alarms |
| Live / clip | "Visa live från uppfarten" | Video |
| Playback | "Spela klipp från igår kväll vid entrén" | Video |
| Stats | "Hur många larm senaste veckan?" | Dashboard |
| Tracking | "Följ personen från uppfart till entré" | Tracking |
| List policies | "Lista agenter" | Agents |
| Explain | "Varför fick jag larm kl 23:14?" | Chat + link to clip |

Phase 0 UI: **mock intent routing** in client. Phase 1+: LLM + tool calling against real APIs.

## Monitoring agents (product concept)

An **agent** is a persisted policy the system runs continuously:

- Scope: camera(s), zone(s), schedule
- Trigger: detection class, VAPIX event, threshold
- Action: notify, clip, escalate, call webhook
- Oversight: human can pause, edit, audit in Agents workspace

Distinct from **Cursor review skills** (dev tooling) — operator agents are runtime product objects.

## Principles

1. **Conversation is the spine** — menus are shortcuts, not the home screen.
2. **Every answer can open evidence** — clip, chart, or rule that fired.
3. **Explainability** — agent replies cite rule id, model version, camera.
4. **Progressive disclosure** — power UI panels don't clutter chat until needed.

## Phasing

| Phase | Chat | Workspaces |
|-------|------|------------|
| Now | Mock replies + intent | Shell panels, mock data |
| 1 | API + real camera names | Live/playback wired |
| 2 | Tool use for incidents | Tracking v1 |
| 3 | Full NL search | Agent builder + run history |

## Related

- [vision.md](vision.md)
- [ui-phase1.md](ui-phase1.md)
- [web/README.md](../../web/README.md)
