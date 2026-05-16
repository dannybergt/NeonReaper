# ADR-010 — 3D-Render-Atlas-Pipeline (revoked ADR-008 für Charaktere)

- **Date:** 2026-05-16
- **Status:** Accepted
- **Supersedes (partial):** ADR-008 (100% custom-rendered Sprites) — gilt nicht mehr für Charakter-Sprites. FX-/Umgebungs-Sprites (Bullets, Sparks, Smoke, Lane-Tile, Gate-Frame, Crate, Vignette, Boss) bleiben Phaser-Graphics.
- **Related:** ADR-007 (Last-War-Look), ADR-009 (Lane-Defense-Genre)

## Context

Owner-Feedback in 3 aufeinanderfolgenden Phasen ("noch immer mies", "viel viel besser werden") hat klar gemacht, dass 100% Phaser-Graphics-Sprites das Polish-Niveau der Last-War-Werbevideos nicht erreichen können — die zeigen 3D-gerenderte Charaktere. Owner hat in der vierten Iteration explizit **Option 2 (3D-Render → PNG-Atlas)** gewählt.

## Decision

**Charakter-Sprites werden offline durch Blender aus 3D-Modellen + Animationen vorgerendert und als Atlas in Phaser geladen.**

### Asset-Quelle

- **Kenney "Animated Characters 3" Pack** (CC0, kein Attribution-Zwang, kommerziell frei).
- Bezug: `https://archive.org/download/kenney_animated-characters-3/kenney_animated-characters-3.zip` (Mirror des Kenney-Originals).
- Bestandteile:
  - 1 Basis-Mesh: `characterMedium.fbx`
  - 4 Skins als PNG: humanMaleA, humanFemaleA, zombieMaleA, zombieFemaleA
  - 3 Animationen als FBX: idle, run, jump (jeweils mit Action "Root|Root|Run" usw.)
- Liegt unter `assets/source/kenney_animated-characters-3/` (im Repo committed weil CC0).

### Render-Pipeline

1. **`scripts/render_sprite.py`** — Blender-Headless-Skript.
   - Lädt Charakter-FBX.
   - Optional: lädt Animation-FBX, sucht passende Action im Pool (`run` > `walk` > `idle`), wendet sie aufs Char-Armature an.
   - Auto-Frame Kamera: ORTHO, 60° Tilt, Track-To-Constraint zum Modell-Bbox-Zentrum, `ortho_scale` deckt Modell + 25% Margin.
   - 3-Sun-Lighting (Key/Fill/Rim).
   - Workbench-Render-Engine (zuverlässig in --background-Mode, anders als EEVEE_NEXT in Blender 5.1.1).
   - 192×192 PNG mit transparentem BG.
   - Pro Aufruf: 1 Skin × N Frames (Frame-Liste als CSV).
2. **`scripts/pack_atlas.py`** — Pillow-Skript.
   - Sammelt `<name>_<idx>.png` Files aus `assets/atlas/raw/`.
   - Tight-crop via `getbbox()`.
   - Greedy-Pack in Power-of-2-Atlas (256/512/1024/2048/4096).
   - Output: `public/atlas/sprites.png` + `public/atlas/sprites.json` (Phaser-JSON-Hash-Format).

### Atlas-Inhalt (Stand 2026-05-16)

- 4 Charaktere × 4 Walk-Frames = 16 Frames
- Atlas: 512×512 px, 16 KB PNG
- Frame-Namen: `player_00..03`, `grunt_00..03`, `shock_00..03`, `heavy_00..03`

### Phaser-Integration

- `PreloadScene` lädt `this.load.atlas("sprites", "atlas/sprites.png", "atlas/sprites.json")`.
- `PreloadScene.registerAnimations()` definiert `walk_player`/`walk_grunt`/`walk_shock`/`walk_heavy` mit 10 FPS Loop.
- `GameScene` ersetzt `this.add.image(... "tex_soldier")` durch `this.add.sprite(... "sprites", "player_00").play("walk_player")`.
- Squad + Enemies haben pro-Sprite zufälligen Start-Frame für organische Formation.

### Was NICHT 3D-gerendert wird

- **Boss** (Reaper Lord): bleibt Phaser-Graphics-Sprite (280×200), eigene Optik gewünscht, kein passendes Kenney-Modell.
- **FX/Effekte**: Bullets, Muzzle-Flash, Hit-Spark, Smoke, Vignette — alles Phaser-Graphics.
- **Umgebung**: Lane-Tile (scrollend), Lane-Edge, Gate-Frame, Weapon-Crate — Phaser-Graphics.

## Konsequenzen

**Positiv**
- Echter 3D-Look für die Charaktere, klare Distanz zu Phaser-Graphics-Ergebnis.
- Walk-Cycle-Animation funktioniert nativ über Phaser-Anims.
- CC0-Lizenz → keine Attribution, keine kommerzielle Sperre.
- Pipeline ist reproduzierbar (Skript-basiert), neue Charaktere = neue Skins durch + 4 Renders.
- Bundle-Impact gering: Atlas 16 KB, Source-Files (FBX) liegen unter `assets/source/` und sind kein Build-Bestandteil.

**Negativ / Risiken**
- Repo-Größe wächst um ~700 KB durch Kenney-Pack-ZIP-Inhalt unter `assets/source/`. Akzeptabel.
- Blender wird zur Build-Dependency wenn neue Renders gemacht werden müssen. **`npm run build` ist davon nicht abhängig** — Atlas ist precomputed und committed.
- Walk-Anim ist 4 Frames, leicht hölzern. Erhöhen auf 8-12 Frames möglich, kostet aber Atlas-Size.
- Kenney's Modell ist erkennbar (Vector-Cartoon-Style mit blocky proportions). Last-War-3D ist detaillierter — wenn Owner nach Tests sagt "noch nicht genug", ist nächster Schritt: anderes 3D-Modell-Pack (Quaternius "Modular Survivors") oder Synty €€.

**Bewusst nicht entschieden**
- Keine Multi-Direction-Renders (8-Richtungen). Lane-Defense braucht nur ↑ und ↓.
- Kein Atlas-Compression (PNG bleibt unkomprimiert pro Frame). Phaser kann auch das laden, Bundle-Impact zu klein für Optimierung.
- Keine SVG- oder Vektor-Sprites — Atlas-Rasterizing reicht.

## Rollback

Reversibel. ADR-010 auf Superseded setzen, PreloadScene-Atlas-Load entfernen, GameScene zurück auf `this.add.image("tex_soldier")`, SpriteFactory-Builder reaktivieren (sind als void-references erhalten).

## Asset-Lizenzen

- Kenney Animated Characters 3 v1.1 — **CC0 1.0 Universal**. Quelle: `assets/source/kenney_animated-characters-3/License.txt`. Keine Attribution-Pflicht. Kommerzielle Nutzung erlaubt.
