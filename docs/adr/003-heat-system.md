# ADR-003 — Heat-System als Stärke-Senkung #1

- **Date:** 2026-05-15
- **Status:** Accepted
- **Related:** ADR-001 (Brief: USP "Stärke die zu- **und** abnimmt"), ADR-002 (Progression)

## Context

Aus dem Brief in ADR-001:
> User wollte explizit das, was Werbung im Genre … suggeriert aber nicht liefert: … **Stärke die zu- und abnimmt** (Heat-System, Curse-Elites, Trade-Off-Upgrades, Boss-Pressure-Modus).

Phase 1 hatte mit `rampage` einen ersten Trade-Off-Träger. Das genügt aber nicht, denn `rampage` ist eine einmalige Wahl. Wir brauchen eine **kontinuierliche** Stärke-Schwankung, die sich aus dem Spielerverhalten ergibt.

## Decision

**Heat-System** als pure module `src/systems/HeatSystem.ts`:

- `current` Wert steigt bei jedem Schuss um `perShot` (default 4.5).
- `current` decayed kontinuierlich um `decayPerSec` (default 18).
- Ab `penaltyThreshold` (default 70 von 100) wird der `pistolFireRateMs` multipliziert mit `fireRateMultiplier(h)`, der von 1.0 (am Threshold) bis `penaltyMult` (1.7 bei max) linear skaliert.
- Bei max Heat schießt der Player also ~41% langsamer.
- Heat-Bar im HUD (orange normal, rot in Overheat).

Berechnung im Game-Loop:
1. `tickHeat(heat, dt)` pro Frame.
2. `fireRateMultiplier(heat)` bei jedem Schuss als Cooldown-Multiplikator.
3. `registerShot(heat)` direkt nach Schuss.

**Tuning-Defaults** (in `createDefaultHeat`):
- 100 Heat / 4.5 pro Schuss → ~22 Schüsse bis 100% Heat.
- Decay 18/s → bei pausiertem Schießen ~3.9 s von max auf Threshold.
- Threshold 70% → ~16 Schüsse bis Penalty einsetzt.
- Max-Penalty 1.7× Cooldown → ~41% langsamer.

## Konsequenzen

**Positiv**
- USP wird im Sekundentakt sicht- und spürbar (Heat-Bar steigt, Schussrate sinkt).
- Pure module → vollständig Vitest-getestet (8 Tests), keine Phaser-Deps.
- Konfigurations-Defaults im Code, später per ADR oder Upgrade modifizierbar.
- Spätere Upgrades können explizit Heat-Mechanik adressieren: "Coolant" (mehr decay), "Suppressor" (weniger perShot), "Overdrive" (kein Penalty aber permanenter -10% Damage = Trade-Off).

**Negativ / Risiken**
- Aktuell nur auf Pistole — mit weiteren Waffen muss Heat entweder global oder pro-Waffe modelliert werden. **Annahme: global** bis ADR widerruft, weil das den taktischen Druck schärft.
- Kein visueller Player-Feedback-Effekt jenseits HUD (kein Rauch, kein Glüh-Tint) — Phase 2-Polish.

**Bewusst nicht entschieden**
- Kein expliziter "Vent"-Cooldown-Modus (zwangspause). Decay reicht.
- Kein Heat-Knockback. Bewusst, damit der Spieler nicht kaltgestellt wird.
- Keine Skill-Mechanik (z.B. "perfekt timed Schuss reduziert Heat"). Zu früh, YAGNI.

## Rollback

Pure module, vollständig isoliert. Entfernen erfordert: HeatSystem.ts löschen, Imports + Aufrufe in GameScene löschen, HUD-Heat-Bar löschen.
