# NeonReaper — Architecture

## Tech-Stack

| Layer            | Choice                              | Reason                                          |
|------------------|-------------------------------------|-------------------------------------------------|
| Renderer / Engine| Phaser 3 (WebGL)                    | Ausgereift, Mobile-tauglich, riesiges Ökosystem |
| Sprache          | TypeScript (strict)                 | Typsicherheit, Refactor-Stabilität              |
| Build / Dev      | Vite                                | Schneller HMR, Tree-Shaking, Mobile-Preview     |
| State            | Custom Lightweight ECS (in-file)    | Auto-Shooter braucht keinen ECS-Schweinwurf     |
| Audio            | Phaser Sound (Web Audio API)        | Built-in, mobil-kompatibel                      |
| Persistenz       | `localStorage` (MVP) → IndexedDB    | Run-Stats, Meta-Unlocks                         |
| Mobile Wrap      | Capacitor (Android Phase)           | Web-Bundle bleibt unverändert, native Bridge    |
| CI               | GitHub Actions                      | Build, Lint, Typecheck, Image-Push              |
| Container        | Multi-Stage Docker (Node → nginx)   | Statische Auslieferung, klein, signierbar       |

## High-Level-Flow

```
┌──────────────────────────────────────────────────────────┐
│ index.html → src/main.ts → Phaser.Game                   │
│   ├─ BootScene     (asset bootstrap, loading bar setup)   │
│   ├─ PreloadScene  (load atlases, audio, fonts)           │
│   ├─ MenuScene     (title, start, settings)               │
│   └─ GameScene     ◀── alle Systeme leben hier            │
│        ├─ Player      (entity)                            │
│        ├─ EnemySpawner(system, wellenkurve)               │
│        ├─ WeaponSystem(system, auto-aim + fire)           │
│        ├─ ProjectileSystem                                │
│        ├─ PickupSystem(XP, Health, Crates)                │
│        ├─ LevelUpSystem(pause + choice UI)                │
│        ├─ HeatSystem  (Stärke-Senkung — siehe unten)      │
│        ├─ CameraRig   (zoom, screen shake, follow)        │
│        └─ FxSystem    (particles, hit flashes, bloom)     │
└──────────────────────────────────────────────────────────┘
```

## Stärke-Schwankungs-Mechanik (Unique Selling Point)

Der User hat explizit gefordert: "Stärke muss zu- und abnehmen können". Standard-Survivor-Spiele sind ausschließlich monoton aufwärts → wir bauen bewusst Down-Phasen ein:

1. **Heat / Overheat** — jede Waffe erzeugt Hitze pro Schuss; bei Threshold Erreichen sinkt Feuerrate global um 50 % für 8 s. Reduzierbar durch "Cooling"-Upgrades.
2. **Curse-Elites** — seltene Elite-Gegner applizieren temporäre Debuffs (-20 % move-speed für 15 s).
3. **Trade-Off-Upgrades** — Level-Up-Optionen wie "+80 % damage, -30 % move-speed". Zwingt den Spieler zu echten Entscheidungen statt nur stacking.
4. **Boss-Aura** — Boss-Anwesenheit aktiviert globalen "Pressure-Modus": Pickups halten weniger lang, XP-Drop −25 %.

Diese vier Mechaniken zusammen erzeugen den vom User gewünschten **Spannungsbogen** statt Power-Treppe.

## Waffenkategorien (MVP)

| Kategorie | Mechanik                                  | Skalierung mit Level                       |
|-----------|-------------------------------------------|--------------------------------------------|
| Pistol    | Single-shot, hohe Reichweite, schnell     | +damage, +crit-chance                      |
| Shotgun   | Cone, 5–9 Projektile, kurze Range         | +pellets, +cone-width                      |
| Drone     | 1–4 orbitende Drohnen, dauerfeuer         | +drohnen, +orbit-speed                     |
| Plasma    | Lobbed AoE-Bombe, slow, hoher Schaden     | +radius, +zweite Bombe pro Schuss          |

Synergien (kommen Post-MVP): Pistol + Drone = "Linked-Fire" (Drone repliziert Pistol-Schuss).

## Asset-Strategie

- **MVP:** prozedurale Phaser-Graphics (Rects, Circles, Lines mit Glow-Filter) — kein Asset-Pack nötig, sieht durch Bloom + Trails trotzdem "neon" aus
- **Phase 2:** Kenney.nl / OpenGameArt CC0-Sprites als Basis
- **Phase 3:** AI-generierte Sprites + manuelle Politur, oder kommerzielles synty/CraftPix Pack

## Performance-Budget

- **Target Frame Rate:** 60 FPS Desktop, 50+ FPS Mid-Tier Android
- **Entity-Cap:** 500 aktive Gegner gleichzeitig (Object-Pool, Phaser Groups)
- **Projektil-Cap:** 1000 (gepoolt)
- **Texture-Memory:** < 50 MB total

## Sicherheits-Architektur

Siehe `SECURITY.md`. Kurz:
- Keine Server, kein Backend → Angriffsfläche minimal
- localStorage-Saves sind nicht trusted (Cheating ist OK in einem Single-Player-Spiel)
- Bei späterer Server-Anbindung: Score-Submission nur mit signed payload, Replay-Validierung
