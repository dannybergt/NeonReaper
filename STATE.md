# NeonReaper — Current State

_Last updated: 2026-05-15 (Phase 2a + 2b + 2c + 2d — bis Boss)_

## What's running

Nichts läuft als Service. Lokal **typecheck ✅**, **vitest 47/47 ✅**, **build ✅**.
Browser-Manual-Run für Phase 1+2 steht weiterhin aus.

## Allocated Ports

| Port | Service        | Note                                   |
|------|----------------|----------------------------------------|
| 5173 | Vite Dev       | nicht aktiv — gestartet via `npm run dev` |
| 8080 | nginx (Docker) | nicht aktiv — gestartet via `docker compose up` |

Aktuell keine Ports allokiert. Vor jedem Start: Port-Check.

## Was wurde gemacht (Session 2026-05-15 — Phase 2d: Boss bei Minute 5)

- **BossSystem** (`src/systems/BossSystem.ts`):
  - `BOSS_CONFIG` — HP 2500, Speed 36, Damage 35 (throttled), 8-Way-Spread alle 2 s, Bullet-Speed 220.
  - `shouldSpawnBoss(elapsedSec, alreadySpawned)` — Pure Boolean.
  - `bulletPatternAngles(count, baseAngle)` — Pattern-Generator, deterministisch.
  - 7 Vitest-Tests grün.
- **Boss in GameScene**:
  - Einmaliger Spawn bei 300 s mit Cam-Flash + Shake.
  - Contact-Damage throttled (500 ms), Boss überlebt Player-Berührung.
  - Telegrafierter 8-Way-Spread rotiert pro Schuss um π/16.
  - `enemyBullets`-Group + Player-Overlap → Curse-`incomingDamage` greift hier auch.
  - Boss-Kill: Cam-Flash, alle Enemy-Bullets despawn, XP-Stream-Drop (50× 1 XP in Spirale).
- **Boss-HUD**: zentrale HP-Bar oben mit Label "REAPER LORD", nur sichtbar während Boss lebt.
- **PreloadScene**: `tex_boss` (großer pulsierender Orb), `tex_enemy_bullet` (Magenta).
- **ADR-006** geschrieben.

## Was wurde gemacht (Session 2026-05-15 — Phase 2c: Curse-Elites)

- **CurseSystem** (`src/systems/CurseSystem.ts`):
  - 3-Curse-Pool: Heavy Hand (FireRate ×1.3), Brittle Bones (incoming ×1.25), Foggy Aim (Range ×0.7).
  - `addCurse`, `tickCurses`, `effectiveMult(state, key)` — pure, stack-fähig, 8 Vitest-Tests grün.
- **Curse-Elites** in EnemyTypes:
  - Unlock 180 s, Chance rampt 0 → 18% über 240 s.
  - Cursed: HP×1.5, Damage×1.5, XP×3, Score×4, visuell pulse-tween + Tint.
- **GameScene**:
  - `pistolRange`, `pistolFireRateMs`, `incomingDamage` werden mit Curse-Mults multipliziert.
  - Cursed-Kill triggert `addCurse` + pinker Cam-Flash.
  - HUD listet aktive Curses + Restzeit.
- **ADR-005** geschrieben (revoked ADR-002 YAGNI für Modifier-Stack).

## Was wurde gemacht (Session 2026-05-15 — Phase 2a + 2b)

- **EnemyTypes** (`src/systems/EnemyTypes.ts`):
  - Walker (24 HP / 70 speed / 8 dmg), Runner (12 HP / 140 speed / 6 dmg, ab 30 s), Brute (110 HP / 42 speed / 22 dmg, ab 90 s)
  - `pickEnemyType(elapsedSec, rng)` — pure, gewichtet, deterministic. 8 Vitest-Tests grün.
  - `GAME_CONFIG.enemy.*` entfernt (war Duplikat); ENEMY_TYPES ist neue Wahrheit.
- **HeatSystem** (`src/systems/HeatSystem.ts`):
  - Heat steigt pro Schuss (+4.5), decayed pro Sekunde (-18). Threshold bei 70/100, max FireRate-Penalty 1.7× Cooldown.
  - Pure module, 8 Vitest-Tests grün.
- **GameScene** umgebaut:
  - Spawning gewichtet nach Zeit.
  - Enemy-AI nutzt typ-spezifische Speed.
  - Schaden bei Player-Hit, XP- und Score-Reward typ-spezifisch.
  - Auto-Fire ruft `registerShot` + appliziert `fireRateMultiplier`.
  - HUD um Heat-Bar (orange→rot bei Overheat) + Overheat-Indikator erweitert.
- **PreloadScene** generiert zwei neue Texturen (`tex_enemy_runner` orange Dreieck, `tex_enemy_brute` lila Kreis mit Kern).
- **ADR-003** (Heat) + **ADR-004** (Enemy-Variants) geschrieben.

## Was wurde gemacht (Session 2026-05-15 — Phase 1 Slice)

- **XP-System:** Enemies droppen `tex_xp`-Gem, Player magnetisiert im `pickupRadius`. Level-up bei `xp >= xpToNextLevel(level)`, Carry-Over bei Überschuss. Despawn nach 30 s.
- **Upgrade-System** (`src/systems/UpgradeSystem.ts`):
  - Pool aus 8 Upgrades (common/rare/epic).
  - `pickUpgrades(k, rng)` — pure, deterministisch testbar via injizierter RNG.
  - Trade-Off-Upgrade `rampage` (+50% Damage, −10% Max HP) als erstes Stärke-kann-sinken-Element.
- **`LevelUpScene`** — Overlay-Scene, pausiert Physics-World, zeigt 3 Cards, Auswahl via Maus oder `1/2/3`.
- **`GameOverScene`** — Score/Level/Time, Restart auf `R/Space/Enter`, Menu auf `M/Esc`.
- **`PlayerStats`** (`src/systems/PlayerStats.ts`) — mutables Run-State-Objekt, `createDefaultStats()` reset-fest.
- **HUD erweitert** — XP-Balken, Level-Anzeige, `HP cur/max`.
- **Config** (`src/config/game.ts`) — `enemy.xpReward`, `xp.gemMagnetSpeed`, `xp.gemPickupRadius`, `xp.gemDespawnMs`.
- **Vitest aktiviert** — `vitest.config.ts` + `tests/UpgradeSystem.test.ts` + `tests/PlayerStats.test.ts` (13 Tests grün).
- **ADR-002** geschrieben (`docs/adr/002-progression-and-upgrades.md`).

## Offene Threads / Blocker

- 🔴 **Push schlägt fehl** (unverändert seit 2026-05-13) — `gh auth refresh -h github.com -s workflow`, dann `git push -u origin main`.
- ⬜ Docker-Hub-Repo `dannybergt/neonreaper` und gh secrets `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN` stehen noch aus.
- ⬜ **Manuelle Browser-Verifikation** ist offen — siehe "Bewusst nicht getan".

## Bewusst nicht getan

- Kein Browser-Klickdurchlauf der neuen Level-Up- und GameOver-Scenes. Headless-Bash kann den Phaser-Game-Loop nicht im Browser steuern; HTTP-Smoke ersetzt das nicht. **Vor Phase-2-Start im Browser durchklicken**: Run starten → XP einsammeln → Level-Up → Card pick → Run weiter → Tod → Restart und Menu testen.
- Kein Heat-System / Curse-Elite (Stärke-Senkungs-Mechaniken #1+#2 aus dem Brief) — bewusst auf Phase 2 geschoben. Trade-Off-Upgrade `rampage` ist erster Träger der USP.
- Keine zusätzlichen Gegner-Typen (Runner, Brute) — Phase 2.
- Kein Audio, kein Bloom-Post-Effekt — Phase 2.

## Annahmen (vom User widerrufbar)

- XP-Curve `round(8 * level^1.5)` — Lvl 1: 8, Lvl 5: 89, Lvl 10: 253.
- Trade-Off-Upgrade-Rate = 1/8 im Pool (nur `rampage`). Skalieren wir später hoch, wenn die USP zu schwach durchkommt.
- Restart aktuell ohne Bestätigung → schnellere Iteration im Playtest.
- LevelUpScene blockiert kompletten Game-Loop (Physics paused). Bewusst, damit kein "fair shot" verloren geht.

## Nächster sinnvoller Schritt

1. **Browser-Verifikation** für Phase 1 **+ Phase 2a/2b**:
   - Run starten → Walker spawnen, bei 30 s+ Runner, bei 90 s+ Brute.
   - Sustained Fire → Heat steigt, ab 70% Penalty, Overheat-Indikator im HUD sichtbar.
   - Brute mehrere Sek. ohne Pause beschießen → erzwingt Overheat → testet USP.
   - Level-Up + Card pick weiter wie Phase 1.
2. Push-Blocker auflösen (User-Aktion: `gh auth refresh -h github.com -s workflow`).
3. **Phase-2-Rest-Slices** (in dieser Reihenfolge empfohlen):
   - 2e Zweite Waffenkategorie (Shotgun) — verbessert Upgrade-Pool-Choice & gibt Heat-Mechanik mehr Texture.
   - 2f Audio-Layer (SFX + Royalty-free Track).
   - Phase 3 Polish: Bloom-Postprocess, Hit-Stop, Iso-Tilemap.
