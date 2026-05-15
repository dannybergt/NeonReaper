# ADR-007 — Visual Pivot: Last-War-Polish-Look statt Neon-Noir

- **Date:** 2026-05-15
- **Status:** Accepted
- **Supersedes:** ADR-001 (Genre-Teil: "Neon-Noir-Stil, dunkles Cyberpunk-Setting"). Tech-Stack-Teil von ADR-001 bleibt.

## Context

Nach Browser-Test des Phase-1+2-Builds hat der Owner expliziten Pivot gefordert:

> "das ist extrem häßlich! […] ich will, dass es genaus schick ist, in der darstellung der einzelnen figuren, gegner, waffen etc."

Als visuelles Vorbild hat er **Last War: Survival** (FirstFun) genannt — speziell den "Special Ops / Frontline Breakthrough"-Modus aus den Mobile-Werbevideos. Das Phaser-Render mit prozeduralen Neon-Kreisen + dunklem Grid passt nicht zu dem Polish-Niveau, das er erwartet.

Der ursprüngliche "Neon-Cyberpunk"-Stil aus ADR-001 ist damit obsolet.

## Decision

**Vollständiger Visual-Pivot** auf den Polish-Look der Last-War-Survival-Ads, ohne deren Lane-Pull-Gameplay zu übernehmen (Auto-Shooter-Mechanik aus ADR-001 bleibt).

**Look-Spezifikation:**

- **Setting:** Post-apokalyptische Stadt — Asphalt, Schutt, Stahlbeton.
- **Charakter:** Stilisierter Survivor/Soldat mit erkennbarer Waffe. Rotiert in Schussrichtung. Klare Silhouette mit Helm + Body + Waffe.
- **Gegner:** Zombie-Horden mit klarer Hierarchie:
  - Walker: shambling, brauner Lumpenkörper
  - Runner: dünner Sprinter, leicht rötlich/orange
  - Brute: dicker Tank, dunkel-grau, Panzerung
  - Cursed-Elite: pulsierender Glüh-Effekt, giftgrün
  - Boss: mutierter Riese ("Reaper Lord"), bedrohliche Silhouette
- **Farbpalette** (gedämpft als Basis, neon-knallig nur als Akzent):
  - BG: Asphalt-Grau (`#1a1c20`), Beton-Hellgrau (`#3a3d42`), Straßenmarkierung-Gelb (`#e8c948`)
  - Player: Khaki/Olive (`#7a8a4e`) mit Helm-Schwarz, Bullet-orange (`#ff8c2b`)
  - Enemies: Zombie-braun (`#4a3a2a`), Tank-stahlgrau (`#3a3a42`), Cursed-Toxic-Grün (`#6cff5a`)
  - HUD: Cream-Weiß (`#f0e8c8`) auf Asphalt
  - Akzente Schaden: Hit-Spark-orange/gelb, Critical-Hit-rot
- **Effekte:** Muzzle-Flash, Bullet-Trails, Hit-Sparks-Particles, Death-Smoke, Camera-Shake bei Boss-Spawn.
- **Background:** Asphalt-Layer mit dezenter Straßenmarkierung + verstreute Trümmer-Sprites (statt Neon-Grid).
- **Postprocess:** Bloom-Pipeline auf Akzent-Farben (Muzzle, Bullet, Hit) — kommt in 3b falls Phaser-FX-Pipeline stabil ist.

**Was NICHT übernommen wird:**
- Kein Base-Building / Strategieteil (steht in Brief Nicht-Ziele).
- Kein Lane-Pull-Gameplay.
- Keine Lizenz-/Marken-Konflikte mit Last War selbst — wir kopieren Stil, nicht Identity.

## Konsequenzen

**Positiv**
- Visueller Sprung von "Phaser-Demo" auf "Mobile-Ad-Polish".
- Setting harmoniert mit Player-Bias: Survivor mit Waffe gegen Zombies ist Genre-Konvention.
- Bestehende Mechanik (Heat, Curse, Boss, Upgrades) bleibt unverändert — nur Texturen + Hintergrund + Player-Rotation ändert sich.

**Negativ / Risiken**
- Projekt-Name "NeonReaper" passt nicht mehr zum post-apo-Setting. Vorerst Codename, Brand-Entscheidung später.
- Bestehende ADR-Doku (003 Heat, 005 Curse, 006 Boss) hat keine Visual-Implikationen — die bleiben gültig.
- README/Docs-Hinweise auf "Neon-Noir" werden inkrementell migriert.
- ROADMAP "Phase 3 — Look & Feel Premium" wird zum aktuellen Slice.

## Rollback

Reversibel (Look ist getrennt von Mechanik). Rollback bedeutet:
- ADR-007 auf "Superseded" setzen
- PROJECT_BRIEF zurücksetzen
- Sprite-Factory neuschreiben für Neon-Look
