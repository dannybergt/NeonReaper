# NeonReaper

> 2.5D-isometrischer Auto-Shooter im Neon-Noir-Stil — Wellen, Waffen-Kombi-Upgrades, echte Stärke-Schwankungen statt linearem Powercreep.
> Browser zuerst, Android danach via Capacitor.

## Status

🚧 **Phase 0 — Scaffold.** Noch nicht spielbar. Siehe [`STATE.md`](./STATE.md) für den aktuellen Stand.

## Schnellstart

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Stack

Phaser 3 · TypeScript (strict) · Vite · Vitest · Docker (nginx-alpine) · GitHub Actions

Details: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · Begründung: [`docs/adr/001-tech-stack-and-genre.md`](./docs/adr/001-tech-stack-and-genre.md)

## Dokumentation

| Datei | Inhalt |
|-------|--------|
| [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) | Ziel, Scope, Nicht-Ziele |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Tech-Stack, Game-Systeme, Performance-Budget |
| [`STATE.md`](./STATE.md) | Aktueller Stand, Ports, offene Threads |
| [`DECISIONS.md`](./DECISIONS.md) | ADR-Index |
| [`SECURITY.md`](./SECURITY.md) | Bedrohungsmodell, Härtung, Secrets |
| [`TESTING.md`](./TESTING.md) | Test-Strategie, CI-Gates |
| [`OPERATIONS.md`](./OPERATIONS.md) | Lokales Setup, Docker, Deployment, Rollback |
| [`ROADMAP.md`](./ROADMAP.md) | Phasen MUST/SHOULD/COULD/ROADMAP |

## Lizenz

[MIT](./LICENSE) — siehe ADR-001 für Begründung. Assets werden separat in `public/assets/LICENSES.md` getrackt.
