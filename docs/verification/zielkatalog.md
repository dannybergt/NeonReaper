# Zielkatalog — NeonReaper

> Skelett aus agent-baseline (AGENTS.md §4 Phase 4). Der Maßstab, gegen den der `verifier`
> (`/verify`) am **laufenden** System misst. Ohne diese Datei ist ein Nachweis NICHT
> DURCHFÜHRBAR. Je Zeile: ID, Journey, Beweisschritt, Negativkontrolle (Zustand, in dem der
> Schritt scheitern muss).

| ID | Journey / Zusage | Beweisschritt (Kommando, erwartete Ausgabe) | Negativkontrolle | Kern? |
|---|---|---|---|---|
| Z01 | Dienst startet und ist bereit | `curl -sf http://127.0.0.1:<port>/readyz` → 200 | DB gestoppt → 503 | ja |
| Z02 | Golden Path: _Nutzer kann …_ | _Browser/curl-Schritte, sichtbares Ergebnis_ | _…_ | ja |
| Z03 | Edge Case: _…_ | _…_ | _…_ | ja |
| Z04 | Persistenz: Neustart behält Daten | `docker compose restart` → Datensatz aus Z02 noch da | Volume entfernt → weg | ja |
| Z05 | Sitzung läuft ab und die App bleibt benutzbar | _Ablauf herstellen (TTL kurz stellen), erneut laden_ | _…_ | ja |

**Gesamturteil `ZIEL VOLLSTÄNDIG NACHGEWIESEN` nur bei 100 % der Kernzeilen.**
