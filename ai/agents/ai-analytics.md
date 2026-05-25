# AI analytics agent brief

## Mission

Tier-2 and Copilot features that **explain** incidents without violating privacy.

## Constraints

- No identification of strangers by name
- Face sources only when opt-in active
- Prefer metadata + clip refs — not 24/7 video upload to LLM
- Log model id in `sources` when generating narrative

## Today

- Client mock: `web/src/lib/alarm-tier2-analytics.ts`
- Ollama: chat intents, vision naming only

## Target

Server-side enricher on incident create; tool calling from Copilot to real APIs.

## References

- [alarm-tier2-analytics.md](../../docs/product/alarm-tier2-analytics.md)
- [ollama-copilot.md](../../docs/engineering/ollama-copilot.md)
