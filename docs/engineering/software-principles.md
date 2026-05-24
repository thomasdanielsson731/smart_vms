# Software principles

Guidance for humans and AI contributors. Optimized for a **long-lived home system** operated by a senior engineer who cares about architecture, test, and delivery discipline.

## 1. Clarity over cleverness

- Prefer boring, well-understood components (Postgres, MQTT, FFmpeg) until they fail a measured requirement.
- Name things for the **domain** (`Incident`, `Clip`, `CameraRegistry`), not implementation (`Manager`, `Helper`).
- If a module needs a diagram to explain, split it.

## 2. Contracts before code

- Event schemas and API OpenAPI/spec live in `shared/` and change via review + ADR when breaking.
- No “tribal knowledge” integrations — VAPIX parsers get fixtures.

## 3. Small, reversible steps

- Each PR (or AI session) should advance **one roadmap slice** with visible operator value or testable infrastructure.
- Feature flags for risky analytics; default off until validated at home.

## 4. Test where failure hurts

| Layer | Expectation |
|-------|-------------|
| Parsers / normalizers | Unit tests + golden fixtures |
| Rule engine | Table-driven cases with timestamps/zones |
| API | Contract tests |
| Pipelines | Record/replay or synthetic video (not every commit) |
| UI | Smoke e2e for critical paths only |

See [testing-strategy.md](testing-strategy.md).

## 5. Operability is a feature

- Structured logs (JSON) with `camera_id`, `incident_id`, `trace_id`.
- Metrics: ingest FPS, inference latency, bus lag, disk usage.
- Runbooks linked from alerts (markdown in `docs/` is fine for home).

## 6. Security and privacy by default

- Least privilege service accounts on cameras.
- No secrets in git; `.env.example` documents keys only.
- See [security-and-privacy.md](security-and-privacy.md).

## 7. Performance — measure, then optimize

- Sample frames for inference; do not decode 4K@30 for all cameras on CPU.
- Backpressure on event ingress beats unbounded queues.
- Document expected hardware per phase on roadmap.

## 8. Documentation stays honest

- Mark **Proposed** vs **Decided** (ADR link).
- Delete or archive obsolete docs — do not accumulate contradictions.

## 9. AI-assisted development norms

- Read `AGENTS.md` and relevant docs before generating services.
- Use review skills before large merges.
- AI must not bypass tests or hooks; human owner approves ADRs.

## 10. Definition of Done (implementation phases)

- [ ] Acceptance criteria from roadmap story met
- [ ] Tests added or waived with written reason
- [ ] Observability: log fields + at least one metric where applicable
- [ ] Docs/ADR updated if behavior or contract changed
- [ ] No secrets; config documented in `.env.example` when added

## Code style (when code exists)

- Match language defaults (ruff/black for Python, eslint for TS).
- Errors: wrap with context; never silent swallow on ingest paths.
- Dependencies: pin versions in lockfiles; monthly review for security.

## Anti-patterns

- Monolith rule engine duplicated on edge and server without version sync
- Storing passwords in camera registry rows without encryption
- Alerting on raw motion without debounce
- “Temporary” MQTT topic schemas without version field
