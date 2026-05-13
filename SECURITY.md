# NeonReaper — Security

## Bedrohungsmodell (MVP)

Das Spiel ist im MVP ein **rein client-seitiges, Single-Player-Spiel** ohne Backend, ohne Account, ohne Telemetrie. Damit ist die Angriffsoberfläche minimal — die meisten OWASP-Risiken kommen nicht zum Tragen, weil es keinen Server gibt.

| Risiko-Klasse                  | MVP-Bewertung      | Begründung                                                |
|--------------------------------|--------------------|----------------------------------------------------------|
| SQLi / NoSQLi                  | Nicht anwendbar    | Keine DB                                                  |
| AuthN / AuthZ Bypass           | Nicht anwendbar    | Kein Account-System                                       |
| XSS (im Spiel-Bundle)          | **Relevant**       | Keine `innerHTML`-Nutzung mit User-Input erlaubt          |
| Supply-Chain (npm-Pakete)      | **Relevant**       | Lockfile committen, `npm audit` in CI                     |
| Container-Image-Schwachstellen | **Relevant**       | Trivy-Scan in CI, nginx-alpine als Base                   |
| Secrets im Repo                | **Relevant**       | gitleaks im pre-commit, `.env` in `.gitignore`            |
| Save-Game-Manipulation         | Akzeptiert         | Single-Player — Cheaten betrifft nur den User selbst      |
| Prompt Injection (AI features) | Nicht anwendbar    | Keine KI-Features im MVP                                  |

## Wenn Server-Backend hinzukommt (Phase 3+)

Dann zwingend:
- Score-Submission mit signed payload (HMAC) + Replay-Validierung server-seitig
- Rate-Limits pro IP + pro Account
- DSGVO-Check für jegliche personenbezogene Daten (E-Mail, IP-Logs)
- Audit-Log für Account-Aktionen ohne PII

## Build- & Runtime-Härtung

- **CSP-Header** in nginx-Config: `default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline';`
- **X-Frame-Options:** `DENY` (kein Embedding in fremde Seiten)
- **X-Content-Type-Options:** `nosniff`
- **Referrer-Policy:** `no-referrer`
- **Permissions-Policy:** verbietet camera, mic, geolocation (Spiel braucht nichts davon)

## Dependency Hygiene

- `package-lock.json` committed (Lockfile-Disziplin)
- `npm audit` in CI als non-blocking warning (MVP), blocking ab Phase 2
- Renovate-Bot (Phase 2)
- Lizenz-Check (Phase 2) — keine GPL/AGPL im finalen Bundle

## Secrets

- **Keine Secrets im Repo.** `.env` ist in `.gitignore`, `.env.example` ist Template ohne echte Werte.
- gitleaks läuft als pre-commit-Hook (sobald husky eingerichtet — Phase 2).
- CI-Secrets (`DOCKERHUB_TOKEN`, `DOCKERHUB_USERNAME`) **nur** als GitHub-Repo-Secrets, nie im Code.

## Reporting

Sicherheits-Issues nicht öffentlich melden, sondern an: danny.bergt.db@googlemail.com (Phase 2: dedizierte Mailadresse einrichten).
