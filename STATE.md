# NeonReaper — Current State

_Last updated: 2026-05-13_

## What's running

Nichts läuft als Service. Projekt ist im Scaffold-Status, noch nicht spielbar.

## Allocated Ports

| Port | Service        | Note                                   |
|------|----------------|----------------------------------------|
| 5173 | Vite Dev       | Standard Vite — gestartet via `npm run dev` |
| 8080 | nginx (Docker) | Production-Container — gestartet via `docker compose up` |

> Vor jedem Start: `npm run dev -- --port <free>` falls 5173 belegt. **Niemals** fremde Prozesse killen.

## Was wurde gemacht

- **2026-05-13** Projekt initialisiert
  - Verzeichnis-Skelett (`src/`, `public/`, `docs/adr/`, `.github/`)
  - AGENTS.md-konforme Doks (Brief, Architecture, State, Decisions, Security, Testing, Operations, Roadmap)
  - Erstes ADR (001 — Tech-Stack & Genre-Wahl)
  - Phaser 3 + TypeScript + Vite Scaffold
  - Docker-Multistage (Node-Builder → nginx)
  - GitHub Actions: CI (typecheck + build), Docker-Publish (tagged + main)

## Was läuft / Offene Threads

- [ ] `npm install` lokal noch nicht gelaufen — Build-Sanity steht aus
- [ ] GitHub-Repo `NeonReaper` muss noch erstellt + erster Push
- [ ] Docker-Hub-Repo `dannybergt/neonreaper` muss vom User manuell angelegt + DOCKERHUB_TOKEN als gh secret hinterlegt werden — der CI-Workflow ist bereits dafür vorbereitet

## Nächster sinnvoller Schritt

1. `npm install` & Build verifizieren
2. Erster Spielbarer Slice: Player-Movement + nearest-enemy auto-fire + 1 Gegner-Welle
3. Heat-System als erstes Stärke-Senkungs-Feature
4. Capacitor-Wrap erst _nach_ Browser-MVP

## Bekannte Annahmen (vom User widerrufbar)

- **Asset-Stil MVP = prozedural** (Phaser Graphics + Glow-Filter) statt Sprite-Pack — minimiert externes Asset-Risiko und Lizenzfragen
- **Repo-Visibility = public** auf GitHub (kein NDA, kein kommerzieller Lock)
- **License = MIT** (siehe ADR-001) — Code offen, Assets später separat lizenzieren falls kommerziell
- **Naming** = `NeonReaper` CamelCase in Folder/GitHub, lowercase `neonreaper` wo technisch erzwungen (npm, Docker Hub)
