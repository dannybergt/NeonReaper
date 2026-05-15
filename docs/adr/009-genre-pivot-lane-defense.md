# ADR-009 — Genre-Pivot: Lane-Squad-Defense statt Auto-Shooter

- **Date:** 2026-05-15
- **Status:** Accepted
- **Supersedes (komplett):** ADR-001 (Genre + Tech-Wahl: Genre-Teil wird überschrieben, Tech-Stack bleibt), ADR-002 (Progression / XP), ADR-003 (Heat), ADR-005 (Curse), ADR-006 (Boss-Survivor-Style)
- **Bleibt gültig:** ADR-004 (Enemy-Variants — wir behalten die Walker/Runner/Brute-Stat-Idee, aber als Marsch-Truppen, nicht Verfolger), ADR-007 (Visual Pivot Last-War-Look), ADR-008 (Custom-rendered Sprites)

## Context

Phase 1 + 2 wurden mit der Annahme gebaut "Survivor.io-Familie, 2.5D-Iso-Auto-Shooter, freie Bewegung in alle Richtungen". Nach dem Browser-Test sagte der Owner explizit:

> "ein korridor, in dem von oben/vorn die gegner bzw auch die waffen etc kommen und man die eigene bzw die eigenen einheiten nur mit links und rechts steuert"

Das ist **nicht** das Survivor-Genre, sondern das **Lane-Squad-Defense-Mini-Game**, das in den Werbevideos für **Last War: Survival** beworben wird (aber nicht im echten Spiel enthalten ist — das echte Spiel ist Base-Builder). Andere Genre-Mitglieder: "Stickman Army : The Defenders", "Crowd Master 3D", "Total Battle Crowd", "Tall Man Run"-artige Lane-Spiele.

Der ursprüngliche Brief im PROJECT_BRIEF.md sagte schon "Last Z / Last War als Vorbild" — die Fehlinterpretation lag in der Übersetzung dieser Stichworte zu "Survivor-Genre" statt "Lane-Defense-aus-den-Ads".

## Decision

**Volls­tändiger Genre-Wechsel** zu Lane-Squad-Defense.

### Gameplay-Spezifikation

- **Spielfeld:** vertikaler Korridor (ca. 720 Welt-Pixel breit, scrollend auf Y).
- **Squad:** Trupp aus N Soldaten in Formation, fixiert auf y = unteres Drittel der Camera. N startet bei `INITIAL_TROOPS` (z.B. 8), kann durch Gates und Combat zu- oder abnehmen. Niederlage bei N = 0.
- **Steuerung:** **ausschließlich horizontal**:
  - Tastatur: ←/→ und A/D.
  - Maus: Click oder Drag setzt Squad-Target-X.
  - Touch: Drag bewegt Squad mit Finger.
  - Vertikale Bewegung gibt es nicht.
- **Welt-Scroll:** scrollt von oben nach unten mit konstanter Geschwindigkeit (`SCROLL_SPEED` z.B. 120 px/s). Gegner und Gates sind als statische Welt-Entities platziert und scrollen mit. Die Camera bleibt fixiert auf Squad-y.
- **Auto-Fire:** jeder Soldat im Squad feuert nach oben (y-negative Richtung) mit einer Frequenz `troopFireRateMs`. Schaden pro Schuss `dmgPerTroop`.
- **Gates:** in der Lane erscheinen Paare von Gates (typisch links + rechts). Spieler manövriert Squad durch eines der beiden. Bei Squad-vs-Gate-Overlap: `gate.apply(squad)` wird genau einmal pro Gate aufgerufen, dann wird das Gate verbraucht.
- **Gate-Typen** (Phase 3b Initial-Pool):
  - `+N` additiv (z.B. `+5`)
  - `×N` multiplikativ (z.B. `×2`)
  - `-N` Trap (z.B. `-3`)
  - `+DMG` additiv Damage-Tier (z.B. `+1 dmg`)
  - `×DMG` multiplikativ Damage-Tier (z.B. `×2 dmg`)
- **Enemies:** marschieren am oberen Welt-Rand spawnend nach unten relativ zur Welt. Treffen sie den Squad-Y-Bereich, beginnt Auto-Combat: pro Tick verlieren beide Seiten Truppen proportional zur Gegenseiten-DPS. Verlierer = wer zuerst auf 0 fällt.
- **Boss:** am Ende jeder Welle spawnt ein einzelner großer Gegner-Sprite mit HP-Bar. Während Boss aktiv ist scrollt die Welt nicht weiter (Boss bleibt am oberen Drittel).
- **Wellen:** vorgefertigtes Schedule. Wave 1 = Tutorial (1 Gate-Paar + 1 Enemy-Gruppe + 1 Boss). Späteres Procedural-Schedule ist Phase 4.

### Stärke-zu-und-ab-USP

Der USP aus dem Brief (Stärke schwankt sichtbar) wird durch das Spielsystem selbst getragen — kein Heat-System nötig:
- Squad **wächst** durch positive Gates und besiegte Gegner-Gruppen (kein Drop, aber Wave-Belohnung).
- Squad **schrumpft** durch Traps und Combat-Verluste.
- Damage-Tier wächst durch DMG-Gates, kann durch keine Mechanik sinken (Phase 4 könnte "Damage-Drain"-Trap einführen).

### Was komplett entfernt wird

- XP-Drops + XP-Magnet + Level-Up-Cards
- Heat-System
- Curse-Elites
- Rundum-Spawn + 4-Seiten-Spawn
- Auto-Aim auf nächsten Gegner
- Player als Einzel-Sprite mit Rotation
- WASD-Steuerung
- GameOver durch Player-HP — ersetzt durch Squad-Count

### Was beibehalten wird

- **Tech-Stack** (Phaser 3 + TS + Vite + Vitest + nginx Docker)
- **Sprite-Factory-Architektur** (ADR-008)
- **Last-War-Look** (ADR-007) — gedämpfte Erdtöne + warme Akzente
- **Background**: Asphalt-Tile + Schutt (jetzt scrollend statt statisch)
- **Hit-Sparks / Death-Smoke / Muzzle-Flash** Effekte
- **Boss als optisches Konzept** (großes pulsierendes Sprite)
- **ADRs / STATE / ROADMAP / DECISIONS / AGENTS-Workflow**

## Konsequenzen

**Positiv**
- Endlich übereinstimmend mit User-Vorbild.
- Mechanik ist konzeptionell simpler als Survivor-Stack (kein Auto-Aim, kein Pickup-Magnet, keine Curse-Stacks).
- USP "Stärke ±" emergent aus Gates + Combat, kein extra System.
- Sprite-Factory wird leichter (Squad-Soldat-Sprite ist klein/uniform statt großes Hero-Sprite).

**Negativ / Risiken**
- ~30 Stunden Code aus Phase 1+2 sind obsolet (bleiben als Archive-Branches im Repo).
- Squad-Formation-Render mit N Soldaten kann bei N > 100 Performance-Probleme machen — wir cappen visuelle Soldaten-Anzahl bei 50 und zeigen Restzahl als Text-Label.
- Squad-vs-Enemy-Combat-Math braucht Tuning, sonst entweder Steamroll oder Frustration.

**Bewusst nicht entschieden**
- Projekt-Name "NeonReaper" bleibt vorerst Codename. Brand-Name-Entscheidung kommt nach erstem Lane-Defense-Playtest.
- Phase-1+2-Branches (`feature/phase-1-2-progression-pressure`, `feature/phase-3-visual-pivot`) bleiben im Repo als Archive — nicht löschen, falls wir Bausteine zurückrecyceln wollen.

## Rollback

Reversibel. ADR-009 auf "Superseded" setzen, ADRs 001–006 reaktivieren, `feature/phase-1-2-progression-pressure` als neuen Hauptbranch nehmen. Das wäre aber eine zweite kostspielige Genre-Korrektur — nur wenn der User explizit zurückwill.
