# NeonReaper — Operations

## Lokales Setup

```bash
# Dependencies
npm install

# Dev-Server (Hot Reload)
npm run dev
# → http://localhost:5173

# Production-Build (statisch)
npm run build
# → dist/
```

## Docker (lokale Production-Simulation)

```bash
# Build
docker build -t neonreaper:dev .

# Run
docker run --rm -p 8080:80 neonreaper:dev
# → http://localhost:8080
```

## Ports

Siehe `STATE.md` für die aktuell allokierte Liste. Vor `npm run dev` / `docker compose up` immer Port-Check:

```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
```

Bei Konflikt **niemals** den belegenden Prozess killen — alternativen Port via `npm run dev -- --port 5174` wählen und in `STATE.md` updaten.

## Deployment-Targets

| Stage     | Where                              | Trigger                       |
|-----------|------------------------------------|-------------------------------|
| Dev       | `localhost:5173`                   | `npm run dev`                 |
| Local Prod| `localhost:8080` (nginx Container) | `docker run`                  |
| Public    | Docker Hub `dannybergt/neonreaper` | Push auf `main` + Tag `v*`    |

## Versioning

Semver. Tags `vX.Y.Z` auf Commits in `main`. Docker-Image bekommt:
- `latest` (von `main`)
- `vX.Y.Z` (vom Tag)
- `sha-<short>` (immer)

## Observability (Phase 2+)

MVP hat keine Telemetrie. Sobald ein Backend dazukommt:
- Structured JSON-Logs (Pino oder Winston im Backend)
- Health-Endpoint: `/healthz`, `/readyz`
- Prometheus-Metriken: `/metrics` (Request-Rate, Latency, Error-Rate)
- OpenTelemetry-Tracing optional

## Rollback

- **Statischer Build:** Tag-Switch in Docker Hub, nginx-Container neu starten
- **Frontend-Bug:** zuvor gebautes Image mit Tag `vX.Y.(Z-1)` deployen
- **Datenmigration:** Im MVP nicht relevant (kein Backend). Bei localStorage-Schema-Bruch: Migration v1→v2 in Code, niemals Daten zerstören
