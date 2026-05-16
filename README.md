# NeonReaper (Codename)

> Lane-Squad-Defense im Polish-Look der Last-War-Survival-Werbevideos: du steuerst einen Trupp Soldaten ausschließlich mit ←/→ durch einen scrollenden Korridor, sammelst Truppen- und Damage-Gates, dodgest Traps, beschießt Crates für neue Waffengattungen, kämpfst gegen anrückende Zombie-Trupps und einen Wellen-Boss.
>
> Genre-Pivot am 2026-05-15 (siehe ADR-009). Brand-Name TBD.

## Status

🚧 **Phase 3c — Lane-Defense mit 3D-Render-Pipeline.** Lokal lauffähig, noch im Tuning. Siehe [`STATE.md`](./STATE.md).

## Schnellstart

```bash
npm install
npm run dev
# → http://localhost:5173 (Vite weicht automatisch aus, wenn Port belegt)
```

Controls: **←/→** oder **A/D**, oder **Maus-/Touch-Drag**. `R` für Retry, `ESC` für Menü.

## Stack

Phaser 3 · TypeScript (strict) · Vite · Vitest · Docker (nginx-alpine) · GitHub Actions
Charaktere: 3D-Render → PNG-Atlas (Blender + Pillow + Phaser-Atlas). FX/Umgebung: Phaser-Graphics.

Details: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · ADRs: [`docs/adr/`](./docs/adr/) (Index in [`DECISIONS.md`](./DECISIONS.md))

## 3D-Render-Pipeline

Charakter-Sprites werden offline aus Kenney CC0-Modellen via Blender vorgerendert. Atlas + JSON liegen im Repo.

```bash
# 1) Modelle und Animationen kommen aus dem CC0-Pack unter:
#    assets/source/kenney_animated-characters-3/

# 2) Frames rendern (Blender 5.x in PATH, oder Pfad in Skript anpassen):
"/c/Program Files/Blender Foundation/Blender 5.1/blender.exe" --background \
  --python scripts/render_sprite.py -- \
  "$(pwd)/assets/source/kenney_animated-characters-3/Model/characterMedium.fbx" \
  "$(pwd)/assets/source/kenney_animated-characters-3/Skins/humanMaleA.png" \
  "$(pwd)/assets/atlas/raw/player" \
  up \
  "$(pwd)/assets/source/kenney_animated-characters-3/Animations/run.fbx" \
  3,7,11,15
# → assets/atlas/raw/player_0.png .. player_3.png

# 3) Atlas packen (Pillow muss installiert sein: python -m pip install --user pillow):
python scripts/pack_atlas.py assets/atlas/raw public/atlas
# → public/atlas/sprites.png + sprites.json
```

`npm run build` ist davon nicht abhängig — der Atlas ist precomputed und committed.

## Dokumentation

| Datei | Inhalt |
|-------|--------|
| [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) | Ziel, Scope, Nicht-Ziele (Lane-Squad-Defense) |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Tech-Stack, Game-Systeme, Performance-Budget |
| [`STATE.md`](./STATE.md) | Aktueller Stand, Ports, offene Threads |
| [`DECISIONS.md`](./DECISIONS.md) | ADR-Index |
| [`SECURITY.md`](./SECURITY.md) | Bedrohungsmodell, Härtung, Secrets |
| [`TESTING.md`](./TESTING.md) | Test-Strategie, CI-Gates |
| [`OPERATIONS.md`](./OPERATIONS.md) | Lokales Setup, Docker, Deployment, Rollback |
| [`ROADMAP.md`](./ROADMAP.md) | Phasen MUST/SHOULD/COULD/ROADMAP |

## Lizenz

[MIT](./LICENSE) (Code). 3D-Charakter-Assets: **Kenney Animated Characters 3 (CC0 1.0 Universal)** — siehe `assets/source/kenney_animated-characters-3/License.txt`.
