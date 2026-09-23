<!-- state: v2 -->
# STATE — NeonReaper

> Lebende Datei. Format: `docs/state-v2.md` (agent-baseline). Historie:
> `docs/history/STATE-2026.md`.

## Jetzt

- **Pausiert seit 2026-09-23** (Betreiber-Entscheidung). fleet: `status=pausiert`, es laufen
  keine automatischen Arbeiten; Dependabot/Sync-PRs werden nicht aktiv bearbeitet.
- **Phase:** Lane-Squad-Defense, Phase 3d (Polish-Pass) abgeschlossen; Wave 1 hand-scripted,
  3D-gerenderter Charakter-Atlas (ADR-009, ADR-010). Seit 2026-05-17 keine Spiel-Änderung.
- **Default-Branch auf GitHub:** `feature/genre-pivot-lane-defense` (nicht `main`).
  `origin/main` steht auf dem Merge von PR #1 (7ead777) und ist 2 Commits dahinter
  (STATE-Abschluss 2026-05-17, PR #2 Constitution-Sync). `Docker Publish` triggert nur auf
  `main` und `v*.*.*`-Tags (gemessen 2026-09-23).
- **Letztes Release:** Tag `v0.0.1` auf 7ead777; CI und `Docker Publish` dafür grün
  (2026-05-16).
- **Docker Hub:** `hub.docker.com/v2/repositories/dannybergt/neonreaper/` liefert
  unauthentifiziert 404 (gemessen 2026-09-23) — Repo privat oder nie angelegt, ungeklärt.
- **Tests:** zuletzt typecheck, vitest 37/37 und build grün (Stand 2026-05-17, nicht neu
  gemessen).
- **Zielkatalog** `docs/verification/zielkatalog.md` ist noch das Skelett aus agent-baseline —
  ein `verifier`-Nachweis ist damit nicht durchführbar.
- **Archiv-Branches:** `feature/phase-1-2-progression-pressure` (8a41899) und
  `feature/phase-3-visual-pivot` (6380f2c) bleiben als Archiv; beide sind Vorfahren des
  Default-Branches.
- **Laufend:** nichts.

## Nächster Schritt

- [mensch:entscheidung] Wiederaufnahme NeonReaper (pausiert seit 2026-09-23): wann, und mit welchem Punkt aus „Bei Wiederaufnahme“? Bis dahin keine Arbeit.

## Offene Threads

- **Bei Wiederaufnahme** (derzeit pausiert, nicht abarbeiten):
  - Default-Branch: `main` auf den Stand von `feature/genre-pivot-lane-defense` bringen und wieder als Default setzen? Solange nicht, baut ein Merge in den Default-Branch kein Image.
  - Nach Login prüfen, ob `dannybergt/neonreaper` existiert und die Tags `0.0.1`, `0.0`, `main`, `latest` trägt; Sichtbarkeit (privat/öffentlich) festhalten. Fertig, wenn der Befund hier unter „Jetzt" steht.
  - Polish-Build (3D-Renders, 8-Frame-Walk, Schatten, Boss-Aura) im Browser abnehmen: reicht die Grafikqualität, oder anderes Asset-Pack (kostenpflichtig vs. CC0, Optionen in ADR-010)?
  - Richtung nach der Abnahme: Wave 2..N, Score, Audio, Tuning — Reihenfolge festlegen.
  - `docs/verification/zielkatalog.md` für NeonReaper ausfüllen (statisches Spiel hinter nginx: `/healthz`, Golden Path Wave 1, Edge Case Squad=0 → „SQUAD WIPED").
  - Tuning-Annahmen der Alt-STATE (Historie, „Annahmen": Wave-Dauer, Squad-Start 8, Combat-Tick, Boss-HP) nach `PROJECT_BRIEF.md` übernehmen oder verwerfen? Teilweise überholt (Boss-HP laut Historie inzwischen 320 statt 220).
  - Port-Kill-Zwischenfall 2026-05-17 (Historie, „Offene Threads"): Neustart der betroffenen fremden Anwendung erledigt? Dann Thread streichen.

- Default-Branch ≠ `main` (siehe „Jetzt"); Ursache in der Historie nicht dokumentiert.
- Docker-Hub-Sichtbarkeit ungeklärt seit 2026-05-17 (Workflow grün, API 404).
- Port-Kill-Zwischenfall 2026-05-17: Folgehandgriff beim Owner, Stand 2026-05-17, nicht neu
  gemessen.
- Bewusst zurückgestellt (Stand 2026-05-17): Audio, Particle-Trails als FX-Pipeline,
  Iso-/Tilt-Look, mehrere Wellen / prozeduraler Generator, Meta-Progression, Mobile-Build.

## Ressourcen

| Ressource | Wert | Hinweis |
|---|---|---|
| Vite Dev | Port 5173 | Vite weicht bei Belegung auf 5174/5175/… aus; vor Start Port prüfen, fremde Prozesse nie beenden |
| nginx (Docker) | Port 8080 → 80 | `docker-compose.yml`, nicht aktiv |
| Container | `neonreaper-web` | Image `neonreaper:dev`, keine Volumes |
| Registry | `docker.io/dannybergt/neonreaper` | per `Docker Publish`, Secrets `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN` in GitHub |

## Letzte Session

- **2026-09-23 (Nachtrag):** Projekt auf Betreiberwunsch pausiert; Arbeitspunkte nach
  „Bei Wiederaufnahme“ verschoben (ohne Tags, damit fleet nichts zieht).
- **Datum:** 2026-09-23
- **Was wurde gemacht:** STATE.md auf v2 umgestellt (agent-baseline `state-compact`, autonom).
  Alt-Datei 1:1 nach `docs/history/STATE-2026.md`; Stand gegen `gh`/`git` abgeglichen
  (PR #1 und #2 gemergt, Tag `v0.0.1`, Default-Branch, Docker-Hub-API).
- **Was wurde bewusst nicht gemacht:** keine Spiel- oder Workflow-Änderung, Default-Branch
  nicht umgestellt.
- **davor:** Session vom 2026-05-17 (Phase 3d Polish + GitHub/Docker-Hub-Sync), siehe
  `docs/history/STATE-2026.md`.
