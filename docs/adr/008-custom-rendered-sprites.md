# ADR-008 — 100% Custom-Rendered Sprites via Phaser Graphics

- **Date:** 2026-05-15
- **Status:** Accepted
- **Related:** ADR-007 (Visual Pivot)

## Context

ADR-007 gibt den Look-Pivot vor. Frage: woher kommen die Sprites?

Drei Optionen wurden mit dem Owner geprüft:
1. **CC0-Sprite-Pack** (z.B. Kenney Top-Down Shooter) — schnell shippable, sieht sofort professionell aus, aber externer Brand-Look.
2. **Custom Phaser Graphics** — alle Texturen via `Phaser.Graphics` + `generateTexture` zur Build-Zeit. 100% in-house, mehr Aufwand pro Entity, vollständige Kontrolle.
3. **Externer Künstler** — out of scope für MVP.

Der Owner hat **Option 2** explizit gewählt: "lieber 100% custom-rendered".

## Decision

**Alle Spielsprites werden zur Laufzeit in der `PreloadScene` durch `Phaser.Graphics` + `generateTexture` erstellt.**

**Architektur:**

- Neues Modul `src/render/SpriteFactory.ts` bündelt alle generator-Routinen.
- Pro Entity-Klasse ist eine `build<Name>(g: Phaser.GameObjects.Graphics)` Funktion zuständig:
  - `buildPlayer(g)` — Soldat (Helm, Body, Waffe, Direction-Indicator)
  - `buildWalker(g)` — shambling Zombie
  - `buildRunner(g)` — Sprinter
  - `buildBrute(g)` — Tank
  - `buildBoss(g)` — Mutant
  - `buildBullet(g)`, `buildEnemyBullet(g)`
  - `buildGem(g)` — Loot-Crate / Schraube
  - `buildMuzzleFlash(g)` — kurzer Sprite für Schussmoment
  - `buildSmokePuff(g)`, `buildSpark(g)` — Particle-Texturen
  - `buildAsphaltTile(g)` — kachelbares Asphalt-Pattern
- Jede Funktion ruft `g.generateTexture(key, w, h)` und `g.clear()`.
- `PreloadScene` ruft `buildAll(g, palette)`.
- Palette kommt aus `GAME_CONFIG.palette` und kann jederzeit geändert werden, ohne `SpriteFactory.ts` zu touchen.

**Render-Techniken:**
- Layered Shapes (Circle, Rect, Polygon, Ellipse, Triangle).
- Lokale Linear-/Radial-Gradients via mehrere `fillStyle`-Schritte mit Alpha-Layer.
- Outline via doppelte Stroke (darker outer + lighter inner).
- Direction-Indicator als kleines hellerer Triangle, das relativ zum Body sitzt.
- Sprites sind axis-aligned und werden im Spiel via `setRotation` gedreht.

**Auflösungen** (Welt-Pixel):
- Player: 36×36
- Walker: 28×32, Runner: 22×30, Brute: 44×44
- Boss: 96×96
- Bullets: 8×8 (Player), 10×10 (Enemy)
- Gem: 12×12
- Tile: 64×64

## Konsequenzen

**Positiv**
- Keine Lizenzfragen, keine externen Asset-Downloads, kein Build-Plumbing für PNG-Atlas.
- Volle Kontrolle über jeden Pixel.
- Palette-Swap = neue Welt (z.B. "snow biome") in einer Stunde.
- Sprite-Factory ist deterministisch und ohne State → testbar (z.B. "ruft fillCircle für Helm auf").
- Build-Bundle bleibt klein (kein Asset-Payload).

**Negativ / Risiken**
- Top-Tier-Polish ist mit Phaser Graphics begrenzt — keine echten Schatten, kein Sub-Pixel-Anti-Aliasing-Tuning, keine handgezeichneten Details.
- Visueller Sprung zu echten Mobile-Ads bleibt limitiert. Wenn der Owner nach Phase-3-Test sagt "reicht nicht", ist Option 1 (Kenney) als Fallback weiterhin verfügbar — kein lock-in.
- Sprite-Render-Code ist nicht trivial zu testen visuell — Acceptance erfolgt durch Browser-Smoketest, nicht Unit-Test.

**Bewusst nicht entschieden**
- Kein Sprite-Atlas-Export (würde später für Capacitor-APK relevant, nicht für Browser-MVP).
- Keine Animation-Frames pro Sprite (still für jetzt; Walking-Wiggle kann via Tween + setScale gemacht werden).
- Keine SVG-Quellen (Phaser Graphics ist die Quelle der Wahrheit).

## Rollback

Reversibel. `SpriteFactory.ts` löschen, PreloadScene auf alte oder Kenney-Pack-basierte Texturen umstellen.
