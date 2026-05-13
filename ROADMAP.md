# NeonReaper — Roadmap

Klassifizierung: **MUST** | SHOULD | COULD | ROADMAP

## Phase 0 — Setup ✅ (in Progress)

- ✅ Projektstruktur, AGENTS-konforme Doks
- ✅ Phaser + TS + Vite-Scaffold
- ✅ Docker + GitHub Actions CI
- ⬜ Erster Push GitHub `NeonReaper`
- ⬜ Docker-Hub-Repo `neonreaper`

## Phase 1 — Spielbare Slice (MUST)

Ziel: 5-Minuten-Demo, in der ein Run startet, Gegner gemäht werden, Level-Ups gepickt werden, Tod und Restart funktionieren.

- ⬜ Player Movement (WASD + Mobile-Joystick)
- ⬜ Camera-Follow + sanfter Zoom
- ⬜ Enemy-Spawner mit 1 Gegner-Typ (Walker)
- ⬜ Auto-Aim auf nächsten Gegner
- ⬜ Pistole (Default-Waffe)
- ⬜ Projectile-Pool, Hit-Detection, Death-Effekt
- ⬜ XP-Drop, XP-Magnet (Pickup-Radius wächst mit Level)
- ⬜ Level-Up-UI: 3 Upgrade-Cards
- ⬜ HUD (HP, XP-Bar, Timer, Score)
- ⬜ Death-Screen + Restart-Button

## Phase 2 — Genre-Pflichtausstattung (MUST + SHOULD)

- ⬜ 4 Waffenkategorien (Pistole, Shotgun, Drone, Plasma) — jeweils unique Mechanik
- ⬜ 3 Gegner-Typen + Schwierigkeitskurve (Walker, Runner, Brute) + 1 Boss bei Minute 5
- ⬜ Heat-System (Stärke-Senkung #1)
- ⬜ Curse-Elite-Mechanik (Stärke-Senkung #2)
- ⬜ Trade-Off-Upgrades im Pool
- ⬜ Audio: SFX + Musik (Royalty-free)
- ⬜ Postprocessing-Bloom Pipeline (Neon-Look)
- ⬜ Partikel: Treffer, Tod, Pickup, Level-Up
- ⬜ Mobile-Touch-Controls (Virtual Joystick)
- ⬜ Vitest-Coverage > 60 % auf Core-Systeme
- ⬜ Playwright-Smoke-E2E

## Phase 3 — Look & Feel Premium (SHOULD)

- ⬜ Iso-Tilemap-Render mit Y-Sort (statt flat top-down)
- ⬜ Sprite-Assets (CC0 oder kommerziell, ADR davor)
- ⬜ Screen-Shake, Hit-Stop, Slow-Motion bei Boss-Kill
- ⬜ Meta-Progression: persistente Unlocks (neue Charaktere, Start-Items)
- ⬜ Settings-Screen (Audio, Controls, Sprache DE/EN)

## Phase 4 — Android (MUST sobald Browser-Demo gut)

- ⬜ Capacitor-Integration
- ⬜ Android-Manifest, Icons, Splash
- ⬜ Touch-First-Layout Polish
- ⬜ Performance-Profiling auf echtem Mid-Tier-Device
- ⬜ APK-Build im CI
- ⬜ Optional: signiertes AAB für Play Store

## Phase 5+ (COULD / ROADMAP)

- COULD: Daily-Challenge mit deterministischer Seed
- COULD: Leaderboard (Backend nötig → SECURITY-Erweiterung)
- ROADMAP: iOS via Capacitor
- ROADMAP: Steam-Release via Tauri-Wrap
- ROADMAP: Co-op Online (2 Player WebRTC)
