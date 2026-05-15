# ADR-005 — Modifier-Stack & Curse-Elites (Stärke-Senkung #2)

- **Date:** 2026-05-15
- **Status:** Accepted
- **Supersedes:** Partial YAGNI-Annahme aus ADR-002 ("Modifier-Stack bewusst aufgeschoben")
- **Related:** ADR-001 (Brief: USP zwei Stärke-Senkungs-Mechaniken), ADR-002 (PlayerStats mutable), ADR-003 (Heat), ADR-004 (Enemies)

## Context

ADR-002 hat Modifier-Stack als YAGNI markiert. Phase 2c braucht **temporäre Debuffs** mit Stack-Verhalten: Curse-Elites lassen beim Tod einen 25-s-Debuff zurück, der bei mehreren Kills stacken muss.

Drei Architektur-Optionen:
- A. Debuffs schreiben in `PlayerStats` und merken sich den Original-Wert für Restore. Bei Stack komplex (gleicher Stat doppelt modifiziert → welcher Restore-Wert?). Abgelehnt.
- B. `PlayerStats` aufteilen in `base` + `modifiers`-Cache, der bei jedem Read über `effectiveStats()` läuft. Vollständige Architektur-Änderung. Overkill für 3 Curses.
- C. **Mutables `PlayerStats` bleibt unverändert** für Upgrades (permanent). Curse-Effekte leben in einer separaten `CurseState`, deren `effectiveMult(state, key)` an den paar konkreten Verwendungsstellen multiplikativ angewendet wird.

## Decision

**Option C.** `src/systems/CurseSystem.ts`:

- `CurseDef` = `{ id, label, durationMs, mults: Partial<Record<CurseStatKey, number>> }`
- `CurseStatKey` = `"pistolFireRateMs" | "pistolRange" | "incomingDamage"`
- `ActiveCurse` = `{ def, expireAtMs }`
- `CurseState = { active: ActiveCurse[] }`
- `addCurse`, `tickCurses`, `effectiveMult(state, key)` — pure functions, vollständig getestet.
- 3-Curse-Pool:
  - `heavy_hand` — pistolFireRateMs × 1.3
  - `brittle_bones` — incomingDamage × 1.25
  - `foggy_aim` — pistolRange × 0.7
- Curse-Elite-Spawn (`src/systems/EnemyTypes.ts`):
  - Unlock ab 180 s.
  - Chance rampt 0 → 18% über 240 s.
  - Cursed-Enemy: HP × 1.5, Damage × 1.5, XP × 3, Score × 4, visueller Pulse-Tween + Tint.
- Beim Cursed-Kill: `pickCurse()` → `addCurse(state, def, now)`. Mehrfach-Kills stacken multiplikativ.
- HUD-Zeile listet aktive Curses + Restzeit.

## Konsequenzen

**Positiv**
- Zweite USP-Stärke-Senkung sicht- und spürbar im Run: erst riskanter Kill, dann 25 s mit -30% Range / +25% incoming.
- Pure module → 8 Vitest-Tests, deterministic via injizierte RNG.
- Mehrere Curses stacken sauber multiplikativ ohne Restore-Headaches.
- Erweiterbar: weitere Curse-Stats (z.B. `moveSpeed`) sind eine Key-Hinzufügung in `CurseStatKey` und ein Multi-Anwendungspunkt.

**Negativ / Risiken**
- `effectiveMult` muss an jeder Verwendungsstelle manuell gerufen werden. Wenn jemand einen neuen Verwendungspunkt für `pistolRange` einbaut und vergisst den Mult anzuwenden, wirkt der Curse dort nicht. Mitigation: zentrale Wrapper-Helper später, wenn die Liste der Stats wächst.
- Mehrfach-Stack kann theoretisch sehr hart werden (3× Brittle Bones → +95% incoming). Akzeptiert als Pressure-Mechanik, später cappen wenn Playtest zeigt dass es unfair ist.

**Bewusst nicht entschieden**
- Kein `pickUniqueCurse` (verhindert dass dieselbe Curse mehrfach gezogen wird). Stack soll explizit möglich sein.
- Kein "Cleanse"-Upgrade. Erstes Spielgefühl ohne Counter-Mechanik.
- Curse-Pool ist nicht erweitert um `moveSpeed`-Curse — drei sind genug für Slice 2c.

## Rollback

Reversibel. Entfernen erfordert: `CurseSystem.ts` + `CurseSystem.test.ts` löschen, `EnemyTypes.curseEliteChance/rollCursedElite/CURSE_ELITE` entfernen, GameScene-Curse-Aufrufe + HUD-Zeile löschen.
