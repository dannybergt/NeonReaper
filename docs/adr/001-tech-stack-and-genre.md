# ADR 001 — Tech-Stack & Genre

- **Datum:** 2026-05-13
- **Status:** Accepted
- **Entscheider:** Danny Bergt (Owner), Claude Code (Agent)

## Context

Owner möchte ein Spiel bauen, das hält, was Genre-Werbung suggeriert: Last Z: Survival Shooter, Last War: Survival Game, Survivor.io. Erst Browser, später Android. Verlangt wird:

- progressive Level mit unterschiedlich schweren Gegnern
- Stärke, die zu- **und** abnimmt
- mehrere Waffenkategorien
- "mega cool" optisch

## Decision

- **Genre:** 2.5D-isometrischer Auto-Shooter (Survivor.io-Familie), nicht Base-Building / nicht Twin-Stick
- **Stil:** stylized 2.5D iso, Neon-Noir-Palette (Cyan/Magenta auf Schwarz), Postprocessing-Bloom über Phaser-Pipeline
- **Engine:** Phaser 3
- **Sprache:** TypeScript strict
- **Build:** Vite
- **Mobile-Wrap:** Capacitor (Phase 2), nicht React Native
- **Verteilung:** Web (statisches Bundle via nginx im Docker-Image) + Android-APK über Capacitor

## Alternativen-Bewertung

| Option | Pro | Contra | Entscheidung |
|--------|-----|--------|--------------|
| **Phaser 3 + TS** | Mature, riesiges Ökosystem, gute Mobile-Performance, Capacitor-trivial | 2D-Engine — Iso muss manuell via Y-Sort+Tilt gebaut werden | **Gewählt** |
| Godot 4 (Web+Android-Export) | Nativer Iso, Editor-getrieben, ein Projekt → 2 Targets | Skill-Wechsel (GDScript/C#), Web-Export ist groß (~30 MB WASM) | Verworfen — höhere Iteration über Web mit TS-Refactor |
| Three.js + custom Engine | Volle 3D-Kontrolle, AAA-Bloom möglich | Game-Loop selbst bauen, Mobile-Performance kritisch, längste Time-to-First-Slice | Verworfen — Risiko vs. Nutzen |
| Unity WebGL + IL2CPP | Sehr "premium" möglich | Web-Bundles huge, schlechte Mobile-Browser-Performance, schwer reproduzierbar im OSS-Workflow | Verworfen |

## Konsequenzen

**Positive:**
- Erste spielbare Slice in Tagen, nicht Wochen
- Web und Android aus einem Codebase ohne Engine-Wechsel
- Hot-Reload-Iteration im Browser

**Negative:**
- Echtes 3D unmöglich → 2.5D-Look muss durch Render-Stil (Bloom, Trails, Y-Sort) "gefaked" werden
- Bei Skalierung auf 1000+ Entities müssen Object-Pools sehr diszipliniert sein
- Asset-Pipeline ist nicht Editor-getrieben — Levels & Wellen werden in TS-Daten beschrieben, nicht in einem visuellen Tool

## Naming

Projekt-Slug für alle Systeme:
- Filesystem: `C:\data\codex\NeonReaper`
- GitHub Repo: `NeonReaper`
- Docker Hub Repo: `neonreaper` (Docker Hub erzwingt lowercase)
- npm `package.json` `name`: `neonreaper`
- HTML `<title>`: `NeonReaper`

## Lizenz

**MIT** für Code. Assets werden, sobald nicht-trivial, separat in `public/assets/LICENSES.md` getrackt.

## Status

Accepted. Bedingung zum Re-open: Phaser-Performance reicht für > 500 sichtbare Entities auf Mid-Tier-Android nicht aus → dann ADR-002 mit Engine-Wechsel-Analyse.
