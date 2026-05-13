# NeonReaper — Testing Strategy

## Testpyramide (MVP)

```
        ▲   E2E (Playwright)         — 1–3 Smoke-Tests, Spiel startet, Death-Screen, Restart
       ▲▲▲  Integration (vitest)     — Scene-Loading, Save/Load, Upgrade-Pick-Flow
      ▲▲▲▲▲ Unit (vitest)            — Damage-Calc, Pool-Mechanik, Heat-Build-Up, Wave-Spawner
```

## Test-Runner

- **Vitest** für Unit + Integration (kommt mit Vite, schneller HMR)
- **Playwright** für E2E (Phase 2 — MVP zuerst manuell)

## Was getestet werden MUSS (Pflicht für PR)

| Modul              | Test-Art    | Beispiel-Cases                                       |
|--------------------|-------------|-----------------------------------------------------|
| Damage-Berechnung  | Unit        | Crit-Chance Wahrscheinlichkeit, Resistenzen, Heat-Penalty multiplikativ |
| Object Pools       | Unit        | Pool-Wachstum, Recycle ohne Memory-Leak              |
| Heat-System        | Unit        | Build-Up Kurve, Threshold-Trigger, Cooling-Decay     |
| Wave-Spawner       | Unit        | Schwierigkeitskurve über Zeit, Spawn-Distribution    |
| Upgrade-Pool       | Unit        | 3-aus-N Auswahl, Gewichtungen, keine Duplikate       |
| Save-Game          | Integration | Round-Trip localStorage, Schema-Migration v1→v2      |
| Scene-Wechsel      | Integration | Menu → Game → Death → Menu                           |

## Was manuell verifiziert werden MUSS (Mensch oder Agent im Browser)

Per AGENTS.md §4 Phase 4 ist Browser-Verifikation Pflicht bei UI-Änderungen:
- Run-Start: Player spawnt, Enemy-Wellen kommen, Auto-Aim trifft
- Level-Up: Pause → 3 Upgrades → Auswahl angewendet → Resume
- Death: HP=0 → Death-Screen → Restart → frischer Run
- 60 FPS-Check (Chrome DevTools Performance) bei 200+ Entities

## CI-Gates

In `.github/workflows/ci.yml`:
1. `npm ci` (cached)
2. `npm run typecheck` — TS strict, **muss grün**
3. `npm run lint` — ESLint, **muss grün**
4. `npm run test` — Vitest, **muss grün** (sobald Tests existieren)
5. `npm run build` — Vite Production-Build, **muss grün**

Erst nach allen vier Gates wird das Docker-Image gebaut und gepusht.

## "Tests grün ≠ Feature funktioniert"

Per AGENTS.md ist beides Pflicht: automatisierte Tests **und** manuelle Browser-Verifikation. PRs ohne dokumentierte manuelle Verifikation werden abgelehnt.
