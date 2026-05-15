# ADR-006 — Boss bei Minute 5 (Pressure-Modus aus dem Brief)

- **Date:** 2026-05-15
- **Status:** Accepted
- **Related:** ADR-003 (Heat), ADR-005 (Curse)

## Context

Aus dem Brief in ADR-001:
> Stärke die zu- und abnimmt (Heat-System, Curse-Elites, Trade-Off-Upgrades, **Boss-Pressure-Modus**).

Heat (ADR-003) und Curse (ADR-005) erzeugen kontinuierlichen Druck. Es fehlt das Spike-Event, das alle Stressmechaniken gleichzeitig auf die Probe stellt: der Boss.

## Decision

**Boss bei Minute 5 (300 s)**, einmaliger Spawn. Pure module `src/systems/BossSystem.ts`:

- `BOSS_CONFIG` mit allen Tuning-Werten an einer Stelle:
  - HP 2500, Speed 36, Contact-Damage 35 (throttled auf 500 ms Cooldown)
  - 8-Way-Bullet-Spread alle 2.0 s, Bullet-Speed 220, Bullet-Damage 10, Lifetime 4.5 s
  - Pattern rotiert um `π/16` pro Schuss, damit der Spieler nicht an einer Stelle stehen bleiben kann
  - XP-Reward 50 (als Stream einzelner Gems), Score-Reward 500
- `shouldSpawnBoss(elapsedSec, alreadySpawned)` — Pure Boolean.
- `bulletPatternAngles(count, baseAngle)` — Pure Array von Winkeln.

GameScene-Integration:
- Boss in derselben `enemies`-Group wie normale Gegner → bestehender BulletHit-Overlap funktioniert.
- `isBoss` Flag auf Sprite differenziert Behandlung in `onPlayerHit` (throttled, kein destroy) und `onBulletHit` (eigener Tod-Pfad).
- Separater `enemyBullets`-Group + Player-Overlap → eigene Schaden-Quelle.
- Bei Spawn: Cam-Flash + Shake, Spawn-Interval reduziert sich um 50% (Boost auf andere Spawns), damit der Boss-Kampf nicht in Stille endet.
- Bei Tod: Cam-Flash + Shake, alle Enemy-Bullets despawn, XP-Stream-Drop (50 × 1 XP in Spirale).

Boss-HUD: zentrale HP-Bar oben + Label "◤ REAPER LORD ◥", sichtbar nur während Boss lebt.

## Konsequenzen

**Positiv**
- Min-5-Spike testet das gesamte Drucksystem: Heat erlaubt nicht ewig Sustained-Fire auf Boss-HP, Curse-Elites stacken parallel weiter, normale Spawns reduzieren Bewegungsfreiheit.
- BulletPattern ist pure und testbar (7 Vitest-Tests).
- BOSS_CONFIG zentralisiert alle Tuning-Werte.

**Negativ / Risiken**
- Boss-Kill liefert massive XP-Drops (50 Gems) — vermutlich mehrere Level-Ups direkt hintereinander, was den Spielfluss unterbricht.
- Kein "telegraphing" der Bullet-Pattern — Spieler sieht den Schuss erst beim Abfeuern. Phase 3 könnte Warn-Indikatoren ergänzen.
- Boss hat keine Phasen (z.B. ab 50% HP anderes Pattern). Einfacher Designstand für Phase 2.
- Boss hat keine Curse-Eigenschaft, kein Trade-Off bei Kill.

**Bewusst nicht entschieden**
- Kein 2. Boss oder Boss-Rush.
- Kein Boss-Music-Sting (Audio kommt in 2f).
- Keine Boss-spezifischen Drops (z.B. garantierter Epic-Upgrade) — pure XP.

## Rollback

Reversibel. Entfernen erfordert: `BossSystem.ts` + Test löschen, `tex_boss` + `tex_enemy_bullet` aus PreloadScene streichen, GameScene-Boss-Methoden + State + HUD löschen.
