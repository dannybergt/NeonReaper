# NeonReaper — Current State

_Last updated: 2026-05-15 (Genre-Pivot: Lane-Squad-Defense)_

## What's running

Nichts läuft als Service. Lokal **typecheck ✅**, **vitest 26/26 ✅**, **build ✅** (App-Bundle 25.88 kB).
Phase 1+2-Survivor-Code wurde komplett entfernt — Branches `feature/phase-1-2-progression-pressure` (`8a41899`) und `feature/phase-3-visual-pivot` (`6380f2c`) bleiben als Archiv im Repo.

## Allocated Ports

| Port | Service        | Note                                   |
|------|----------------|----------------------------------------|
| 5173 | Vite Dev       | Standard — Vite wechselt automatisch wenn belegt (5174/5175/…) |
| 8080 | nginx (Docker) | nicht aktiv |

## Was wurde gemacht (Session 2026-05-15 — Genre-Pivot Lane-Defense)

**ADR-009** widerruft ADR-001/002/003/005/006. Neues Genre laut Owner-Brief: Lane-Squad-Defense im Polish-Look der Last-War-Survival-Werbevideos.

- **Brief umgeschrieben** (`PROJECT_BRIEF.md`): Lane-Squad-Defense.
- **Obsolete Module gelöscht**: PlayerStats, UpgradeSystem, EnemyTypes, HeatSystem, CurseSystem, BossSystem, SpawnZone, LevelUpScene, GameOverScene + alle zugehörigen Tests.
- **Neue Lane-Defense-Module**:
  - `src/systems/Squad.ts` — SquadState (troops, damageTier, fireRate), apply* mutations.
  - `src/systems/EnemyGroup.ts` — Enemy-Tiers (grunt/shocktrooper/heavy) mit Stats.
  - `src/systems/Combat.ts` — Auto-Combat-Tick zwischen Squad und Enemy-Group.
  - `src/systems/Gates.ts` — 5 Gate-Typen (`+N`/`×N`/`-N`/`+DMG`/`×DMG`), `applyGate`, `gateVisual`, `rollGatePair`.
  - `src/systems/Waves.ts` — `buildWave1()` als gescriptete Tutorial-Welle (Gates + Enemies + Boss).
- **SpriteFactory neu** (`src/render/SpriteFactory.ts`):
  - `tex_soldier` — 20×24 Top-Down-Soldat mit Helm, Visor, Gewehr nach oben.
  - `tex_enemy_soldier`/`tex_enemy_shock`/`tex_enemy_heavy` — drei Enemy-Tiers.
  - `tex_boss` — 200×144 Mutant Reaper Lord.
  - `tex_bullet`/`tex_enemy_bullet`/`tex_muzzle_flash` — Vertikal-orientierte Projectiles.
  - `tex_gate_frame` — Crossbar + 2 Pylons (Tint-fähig pro Gate-Typ).
  - `tex_lane_tile` (scrollend) + `tex_lane_edge` (Side-Curbs).
- **GameScene komplett neu**:
  - Vertikales Spielfeld (720×1280 portrait).
  - Lane-Tile scrollt nach unten, scrolledPx misst Welt-Distanz.
  - Squad fixiert am unteren Drittel, nur horizontale Bewegung via ←/→ oder Maus/Touch-Drag.
  - Squad-Formation in Grid (max 6 Spalten), rebuild bei Troop-Änderung.
  - Auto-Fire: pro visible Trooper ein Bullet alle `fireRateMs`, Muzzle-Flash am Lauf.
  - Wave-Schedule spawnt Gates/EnemyGroups/Boss bei vordefinierten `distance`-Markern.
  - Gates pulsieren visuell, Squad-vs-Gate-Overlap appliziert Effekt einmalig.
  - Enemy-vs-Squad-Combat als Tick alle 250ms wenn Bounding-Boxes überlappen.
  - Boss-Spawn am Wave-Ende: Cam-Flash + Shake, eigener Bullet-Pattern (5-Way Spread), Boss-HP-Bar oben center.
  - GameOver bei Squad=0 ("SQUAD WIPED"), Win bei Boss-Tod ("WAVE 1 CLEARED").
- **MenuScene neu**: "REAPER — LANE-SQUAD DEFENSE", Controls-Hinweise, "▶ ENTER THE LANE".
- **GAME_CONFIG** komplett umgeschrieben für portrait + Lane-Werte.

## Offene Threads / Blocker

- 🔴 **Push schlägt fehl** (unverändert) — `gh auth refresh -h github.com -s workflow`, dann `git push -u origin main`.
- ⬜ Docker-Hub-Repo + gh secrets ausstehend.
- ⬜ **Browser-Verifikation** der Lane-Mechanik durch Owner — der eigentliche Acceptance-Test diesmal.

## Bewusst nicht angefasst

- Audio (kommt in nächstem Slice nach Owner-OK auf Lane-Mechanik).
- Particle-Bullet-Trails als Phaser-FX-Pipeline.
- Tilt-/Pseudo-3D-Iso-Look.
- Mehrere Wellen + Procedural-Wave-Generator (Wave 1 ist hand-scripted).
- Permanent-Meta-Progression / Upgrades zwischen Runs.
- Capacitor-Mobile-Build.

## Annahmen (vom Owner widerrufbar)

- Wave 1 dauert ca. 35-40 s bei scrollSpeed=140.
- Squad start mit 8 Truppen, Damage-Tier 1.
- Combat-Tick alle 250ms, Damage 0.6 pro Truppe pro Tick.
- Boss-HP 220, Bullet-Damage 1 (Squad), 1 (Boss-Bullet).
- Steuerung-Stil: Drag UND Pfeiltasten gleichzeitig erlaubt.

## Nächster sinnvoller Schritt

1. **Browser-Verifikation** durch Owner — fühlt sich das nach Last-War-Werbung an?
2. Tuning (vermutlich nötig: Combat-Math, Gate-Spawn-Tempo, Squad-Move-Speed).
3. Falls OK: Wave 2..N + Wave-Generator + Score-Tracking.
4. Audio-Layer (SFX + Royalty-free Loop).
