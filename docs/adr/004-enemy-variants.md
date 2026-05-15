# ADR-004 — Enemy-Variants (Walker, Runner, Brute)

- **Date:** 2026-05-15
- **Status:** Accepted
- **Related:** ADR-002 (Progression), ADR-003 (Heat)

## Context

Phase 1 hatte nur Walker. Damit das Heat-System aus ADR-003 echte Trade-Offs erzeugt, müssen Gegner unterschiedlich auf Schussrate, Reichweite, Bewegung reagieren.

## Decision

**Drei Gegnertypen** in `src/systems/EnemyTypes.ts`:

| Type   | HP  | Speed | Damage | XP | Score | Unlocks at |
|--------|-----|-------|--------|----|-------|------------|
| walker | 24  | 70    | 8      | 1  | 10    | 0 s        |
| runner | 12  | 140   | 6      | 1  | 15    | 30 s       |
| brute  | 110 | 42    | 22     | 3  | 40    | 90 s       |

**Gewichteter Picker** `pickEnemyType(elapsedSec, rng)`:
- Walker-Weight konstant 1.
- Runner-Weight rampt von 0 → 1.0 zwischen 30 s und 90 s.
- Brute-Weight rampt von 0 → 0.6 zwischen 90 s und 210 s.

Pure module, deterministic via injizierte RNG → 8 Vitest-Tests grün.

## Konsequenzen

**Positiv**
- Druck-Eskalation natürlich: ab 30 s wird Reichweite kritisch (Runner umzingelt), ab 90 s muss man entscheiden ob man auf den Brute schießt (viel Heat) oder ihn umrundet.
- Konkrete Heat-Tension: Brute fordert sustained fire → forciert Overheat.
- Daten-getrieben → neue Typen = ein Eintrag.

**Negativ / Risiken**
- `GAME_CONFIG.enemy` wurde entfernt — falls externe Tests darauf zugriffen (keine bekannt), brechen sie.
- `pickEnemyType` ignoriert global Cap — bei extrem hoher Spawnrate können theoretisch 100% Brutes spawnen. Tuning später wenn Boss-Mechanik kommt.

**Bewusst nicht entschieden**
- Keine Elite-/Curse-Varianten (Stärke-Senkung #2). Phase 2 nächster Slice.
- Kein Boss bei Minute 5 — separater Slice.
- Kein Projektil-Gegner.

## Rollback

Entfernen erfordert: EnemyTypes.ts löschen, Imports in GameScene auf Walker-only zurückführen, Texturen in PreloadScene zurückbauen, Tests entfernen.
