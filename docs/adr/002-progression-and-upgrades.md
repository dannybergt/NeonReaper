# ADR-002 — Progression & Upgrade-Mechanik (Phase 1)

- **Date:** 2026-05-15
- **Status:** Accepted
- **Supersedes:** —
- **Related:** ADR-001 (Tech-Stack & Genre)

## Context

Mit dem Scaffold aus Phase 0 läuft eine Demo-Schleife: Spawn → Auto-Fire → Tod → Menu.
Damit das Genre-Versprechen (Survivor-likes mit progressiver Stärke, die zu- **und** abnimmt) sichtbar wird, braucht Phase 1 mindestens:

1. XP-Sammelschleife mit pickup-magnet
2. Level-Up-Wahl mit drei Optionen
3. Trade-Off-fähige Upgrades, nicht nur monotones Powercreep
4. Geordneten Death/Restart-Flow

Offene Designfragen:

- Wie schnell soll der Level-Up-Takt sein?
- Wo lebt der mutierbare Spieler-Zustand?
- Wie testen wir den Upgrade-Pool ohne Phaser-Setup?

## Decision

- **`PlayerStats`** als einfaches Mutable-Plain-Object, das die Game-Run-Zustände hält (`moveSpeed`, `maxHp`, `pickupRadius`, Pistol-Stats).
  `createDefaultStats()` liest aus `GAME_CONFIG`, kopiert die Werte raus. Damit ist die Run-Stat-Komponente reset-fest.
- **`UpgradeSystem`** als pure module mit:
  - `UPGRADE_POOL` — readonly Array von `Upgrade`-Objekten, jedes mit `apply(stats)`.
  - `pickUpgrades(k, rng)` — Fisher-Yates über Pool-Indizes, deterministic via injected RNG.
  - Keine Phaser-Deps → Vitest-tauglich.
- **`LevelUpScene`** als Phaser-Scene, die parallel zur GameScene läuft. GameScene pausiert die Physics-World, wartet auf den `onPick`-Callback.
- **`GameOverScene`** als eigene Scene mit Stats, Restart- (R/Space/Enter) und Menu-Shortcut (M/Esc).
- **XP-Curve:** `xpToNextLevel(level) = round(8 * level^1.5)` — Level 1 → 8 XP, Level 5 → ~89, Level 10 → ~253. Schnell genug für früher Auswahl-Spaß, gemächlich genug für Lategame-Druck.
- **Trade-Off-Beispiel:** `rampage` (epic) gibt +50% Damage, kostet -10% Max-HP. Erstes echtes "Stärke kann sinken"-Element.

## Konsequenzen

**Positiv**

- Reine Module → Tests ohne Browser/jsdom.
- Stats sind ein einziges Objekt → spätere Heat-System-Erweiterung (ADR-003 später) kann darauf wirken.
- Cards sind datengetrieben → neue Upgrades = ein Eintrag im Pool.

**Negativ / Risiken**

- `PlayerStats` ist mutable. Bei mehr Effekten (DoTs, Buffs mit Dauer) wird ein Diff-/Modifier-Stack nötig. Bewusst aufgeschoben (YAGNI).
- Kein Save-State: Stats reseten bei jedem Run. Meta-Progression kommt in Phase 3 (Roadmap).
- `pickUpgrades` zieht Upgrades unabhängig der Rarity. Rarity-Gewichtung ist Phase-2-Thema.

**Bewusst nicht entschieden**

- Kein Asset-Wechsel, weiterhin prozedurale Texturen.
- Kein Sound — kommt in Phase 2.
- Heat-System / Curse-Elite noch nicht implementiert (Stärke-Senkungs-Mechaniken #1+#2 aus dem Brief). Trade-Off-Upgrades sind der erste Träger der USP, die anderen folgen in Phase 2.

## Rollback

ADR-002 ist reversibel: bei Rückzug entfernt man `LevelUpScene`, `GameOverScene`, `PlayerStats`, `UpgradeSystem` und die zugehörigen GameScene-Aufrufe. Vor Rollback prüfen, ob spätere ADRs darauf bauen.
