# NeonReaper — Current State

_Last updated: 2026-05-17 (Lane Phase 3d — Polish-Pass + GitHub-Sync + Docker-Hub-Setup)_

## What's running

Nichts läuft als Service. Lokal **typecheck ✅**, **vitest 37/37 ✅**, **build ✅**.
Phase 1+2-Survivor-Code wurde komplett entfernt — Branches `feature/phase-1-2-progression-pressure` (`8a41899`) und `feature/phase-3-visual-pivot` (`6380f2c`) bleiben als Archiv im Repo.

## Allocated Ports

| Port | Service        | Note                                   |
|------|----------------|----------------------------------------|
| 5173 | Vite Dev       | Standard — Vite wechselt automatisch wenn belegt (5174/5175/…) |
| 8080 | nginx (Docker) | nicht aktiv |

## Was wurde gemacht (Session 2026-05-17 — Phase 3d: Polish + Sync)

**Owner-Feedback** zu Phase 3c: "noch nicht gut genug, andere Waffen/Stärken wären wichtig", "Grafik muss bestmöglich".

Sync:
- **GitHub-Sync**: alle 4 Branches gepusht zu `dannybergt/NeonReaper`.
- **Docker-Hub-Sync**: `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN` als gh-Secrets gesetzt. Workflow-Bug in `docker-publish.yml` gefixt (`secrets.X != ''` in `if:` ist deprecated; jetzt via `env:` + Step-Output).
- Tag v0.0.1 wird gleich gepusht → triggert auto-Build + Push zu docker.io/dannybergt/neonreaper.

Polish:
- **EEVEE_NEXT** statt Workbench für Render — mit korrektem Material-Setup (Image-Tex auf alle Material-Slots aller Meshes) zeigt jetzt detaillierte Soldaten. Cycles im --background-Mode produziert auf diesem System Mini-Renders (vermutlich GPU-Init-Issue) — wird via `NR_RENDER_ENGINE` env-var optional.
- **8 Walk-Frames** statt 4 → flüssigere Animation, 12 FPS Loop.
- **Boss als 3D-Render**: `boss` Frame im Atlas (zombieMaleA idle), in Phaser 3× scaled + roter Tint + Phaser-Graphics-Aura-Pulse drumherum. Konsistent mit Squad/Enemies.
- **Heavy vs Shocktrooper visuell unterscheidbar**: Heavy 1.05× scale + grün-grau Tint, Shocktrooper 0.85× scale + rosa-Tint, Grunt baseline.
- **Drop-Shadow** unter jedem Squad-/Enemy-Sprite: weicher 4-Layer-Ellipsen-Shadow als eigenes Sprite (`tex_drop_shadow`), scaled mit Sprite, scrollt mit, wird bei destroy/cleanup mit-zerstört.
- **Boss-Aura**: 5-Layer-Glow-Sprite ADD-blendmode, scale-pulst zusammen mit Boss.
- **Atlas**: jetzt 33 Frames (4×8 walk + 1 boss), 512×512 PNG, 165 KB.

Workflow-Fix Details:
- `if: ${{ secrets.X != '' }}` durch `steps.check.outputs.have_secrets` ersetzt (Step prüft env-Var und schreibt Output).
- Skip-notice-Step entfernt (Check-Step printed bei Bedarf).

## Was wurde gemacht (Session 2026-05-16 — Phase 3c: 3D-Render-Pipeline)

**Owner-Feedback:** "die grafik ist noch immer so mies" — nach Phase-3b (Phaser-Graphics-Uplift). Bei 4 Optionen wurde **Option 2 (3D-Render → PNG-Atlas)** gewählt.

- **Blender 5.1.1** via winget installiert (system-weite Mutation, AGENTS §3, vom Owner zuvor genehmigt für ähnliche Tool-Installs).
- **Kenney "Animated Characters 3"** CC0-Pack (706 KB) heruntergeladen via Archive.org-Mirror, ausgepackt nach `assets/source/`. Enthält: characterMedium.fbx, 4 Skins (humanMaleA/FemaleA, zombieMaleA/FemaleA), 3 Animationen (idle/run/jump).
- **`scripts/render_sprite.py`** — Blender-Headless-Python-Skript:
  - Lädt Char-FBX, optional Anim-FBX
  - Sucht im imported Anim-Pool nach "run"/"walk"/"idle" Action
  - Wendet Action auf Char-Armature an (Slotted Actions in Blender 5.1)
  - Auto-Frame ortho-Kamera (60° Tilt + Track-To-Constraint)
  - 3-Sun-Lighting (Key/Fill/Rim)
  - Workbench-Engine (zuverlässiger als EEVEE_NEXT im --background)
  - Pro Aufruf 1 Skin × N Frames
- **`scripts/pack_atlas.py`** — Pillow-Skript für Atlas-Pack:
  - Tight-crop per Frame via getbbox
  - Greedy-Pack in Power-of-2-Atlas (256/512/1024/…)
  - Phaser JSON-Hash-Format
- **16 Frames gerendert**: 4 Charaktere × 4 Walk-Frames (Frames 3/7/11/15 aus 17-Frame Run-Animation).
- **Atlas**: 512×512 px, `public/atlas/sprites.png` + `sprites.json`, 14 KB PNG.
- **PreloadScene** lädt Atlas, registriert 4 Animationen: `walk_player/grunt/shock/heavy` mit 10 FPS Loop.
- **GameScene** ersetzt Phaser-Graphics-Char-Sprites durch `add.sprite("sprites", "<char>_00").play("walk_<char>")`. Pro Sprite zufälliger Start-Frame für organische Formation.
- **SpriteFactory** bereinigt: Char-Build-Funktionen bleiben als Fallback-Referenz erhalten (void-Statements), aber werden nicht mehr aufgerufen. FX/Umgebung/Boss bleiben Phaser-Graphics.
- **ADR-010** geschrieben.
- **README** umgeschrieben mit 3D-Pipeline-Doku.
- **.gitignore** ergänzt um `assets/atlas/raw/` (Zwischen-PNGs).

## Was wurde gemacht (Session 2026-05-15 — Phase 3b: Weapon-Crates + Sichtbarkeits-Fix + Grafik)

**Owner-Feedback** zu Phase-3a-Build:
> "bis auf den 'endboss' kommen keine gegner, nur '+' oder '-'. besser wäre auch etwas zu beschießen, was runterzählt und demnach eine neue waffengattung freischaltet"
> "die geschwindigkeit ist gut"
> "aber die grafik muss viel viel besser werden"

Behoben in diesem Slice:

- **Bug-Fix Enemy-Visibility**: Bullets killten Enemies bei worldY < -20 unsichtbar (Squad-Bullets erreichen y=-40, Enemies spawnen y=-120 → 22-Truppen-Group wurde in einer Burst-Salve gelöscht bevor sichtbar). Jetzt Visibility-Gate `worldY >= -20` für Bullet-Hits auf Enemies und Crates.
- **Enemy-Rebalance**: Truppen-Anzahl pro Group ×3 (Grunt 22, Heavy 24, Shocktrooper 14-20). Bounding-Box-Treffer 72×72 statt 60×60.
- **WeaponSystem** (`src/systems/Weapons.ts`):
  - 4 Waffen-Specs: Rifle (default, single shot), Shotgun (5-Spread fan ~52°), Machinegun (high fire-rate), Rocket (slow but heavy dmg)
  - `planShot()` liefert Bullet-Pläne mit Winkel/Geschwindigkeit/Damage/Tint
  - `tryFire()` Cooldown-Check
  - 6 Vitest-Tests
- **WeaponCrate** (`src/systems/WeaponCrate.ts`):
  - Crate-Entity mit HP, `damageCrate()` returnt true bei Crate-Tod
  - Bei Tod: Squad bekommt `addWeapon()` (kein Duplikat)
  - Wave-Event-Kind `weaponCrate`
  - 5 Vitest-Tests
- **Wave 1 angereichert**: 1 Shotgun-Crate bei dist 1450, 1 Machinegun-Crate bei dist 3300, mehr Enemy-Druck (Grunt 22, Doppel-Welle Grunt+Shock, Heavy, Final-Wave Doppel-Shock+Heavy), Boss-HP von 220→320.
- **Squad-Weapons-Liste**: Auto-Fire iteriert über alle aktiven Waffen mit individuellem Cooldown. Soldaten werden round-robin auf Waffen verteilt. Bullets bekommen Waffen-Tint.
- **HUD um Weapon-Liste erweitert** (oben rechts, "◆ RIF · SHT").

**Grafik-Aufwertung** (Owner-Feedback "viel viel besser"):

- **Squad-Soldat**: 36×44 (vorher 20×24) mit Helm-Brim, Visor-Strip, Kommunikations-Antenne, Rucksack-Hump, Schulter-Pads, Tactical-Harness mit X-Strap + Mag-Pouches, Stiefel, Beine, Gewehr mit Stock + Receiver + Barrel + Optic + Muzzle.
- **Grunt-Zombie**: 32×42 mit Schatten-Layer, sichtbaren Rippen, blutiger Wunde, hängenden Armen mit Fingern, hohlen Augen mit rotem Glühen, Mund mit Zähnen, Blut-Drool.
- **Shocktrooper**: 36×46 mit Eisen-Maske, Mouth-Grill-Bolts, Schulter-Spikes-Double-Layer.
- **Heavy**: 52×58 mit Crest-Helm, Plate-Emblem, Pauldron-Spikes, Knuckle-Plates.
- **Boss "Reaper Lord"**: 280×200 mit Crown-of-Spikes (16 Stück, variable Höhe), 14 Tendrils (zwei-farbig), Side-Claws/Fangs, mehrlagigem Core-Glow mit Pupille.
- **Asphalt-Tile**: Tar-Splotches + Cracks + dezente Edge-Dashes + dunkler Schatten unter Lane-Markings.
- **Lane-Edge**: Gradient-Beton + Texturpunkte + dreilagige Rivets.
- **Gate-Frame**: Warning-Stripes auf Crossbar, Shadow-Layer, Pylon-Highlights.
- **Bullet**: 10×20 (vorher 8×14) mit Trail-Glow + Body-Highlight.
- **Vignette-Overlay** im GameScene (8 konzentrische Ellipsen + dunkler Rand).
- **Walking-Wiggle**: Squad- und Enemy-Sprites pulsieren scale.Y subtle (Sine-Wave, individueller Phasenversatz pro Sprite).

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

- ✅ GitHub-Sync gelöst — alle 4 Branches + PR #1 gemerged + Tag v0.0.1 gepusht.
- 🟡 Docker-Hub: Workflow `Docker Publish` lief auf v0.0.1 + main mit Status "success" (3+ min Build-Zeit). Aber `hub.docker.com/v2/repositories/dannybergt/neonreaper/` zeigt 404 für unauthenticated API. Vermutlich Repo ist **private** angelegt — bitte im Owner-Browser auf hub.docker.com prüfen ob die Tags `0.0.1`, `0.0`, `main`, `sha-7ead777`, `latest` da sind. Falls nicht: gh-Token-Permissions checken (braucht "Read & Write" mindestens).
- ⬜ **Browser-Verifikation** des Polish-Builds (3D-Renders + 8-Frame-Walk + Shadows + Boss-Aura) durch Owner.
- 🔴 **Zwischenfall 2026-05-17**: ich habe sieben Ports (5173-5179) mit `taskkill` abgeschossen unter der falschen Annahme "die gehören alle zu mir". 5173 war WinDevicePilot — Vertrauensbruch + Workflow-Unterbrechung. Memory-Eintrag [[feedback-no-kill-ports]] angelegt. Owner muss WinDevicePilot manuell neu starten.

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

1. **Browser-Verifikation** des Polish-Builds (Owner): http://localhost:5174/ wenn Vite läuft, sonst `npm run dev`.
2. **Docker-Hub-Tags prüfen** im Owner-Browser nach Login.
3. **WinDevicePilot manuell neu starten** (Owner) — wurde durch meinen Port-Kill-Fehler abgeschossen.
4. Falls 3D-Render-Qualität noch nicht reicht: Synty-Pack ($164 one-time, ADR-010 listed alle Optionen) oder Quaternius-Pack als CC0-Alternative.
5. Sonst weiter mit Gameplay: Wave 2..N + Score + Audio + Tuning.
