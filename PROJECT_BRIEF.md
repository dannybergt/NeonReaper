# NeonReaper — Project Brief

> **Codename**, finaler Brand-Name TBD. Genre-Pivot vom Survivor-Auto-Shooter zum **Lane-Squad-Defense** am 2026-05-15 (ADR-009). Phase 1+2 als Archiv-Branches.

## Pitch in einem Satz

Lane-Squad-Defense im Polish-Look der Last-War-Survival-Werbevideos: du steuerst einen Trupp Soldaten ausschließlich mit Links/Rechts durch einen scrollenden Korridor, sammelst Truppen- und Damage-Gates ein, vermeidest Traps, kämpfst gegen anrückende Zombie-Trupps und einen Wellen-Boss.

## Ziel

Ein optisch hochwertiges, einfach zugängliches Spiel im Stil dessen, was Mobile-Ads für **Last War: Survival** zeigen (Special Ops / Frontline Breakthrough), aber nie liefern:

- klare, sichtbare Squad-Progression durch Gates
- Stärke kann steigen **und** sinken (Traps, Combat-Verluste)
- ansprechende Sprites, Treffer-Feedback, Particle-Effekte
- bingebare 5-10 Minuten-Wellen-Runs

## Plattformen (Reihenfolge)

1. **Browser** (Desktop + Mobile-Browser) — Prototyp, schnelle Iteration
2. **Android** — Capacitor-Wrap, Touch-Drag-Steuerung
3. Optional später: iOS, Steam

## Scope MVP (erste spielbare Slice)

- 1 Spielfeld (vertikaler Korridor)
- Squad aus 1..N Soldaten in Formation
- Steuerung: nur ← / → Tastatur + Maus-Drag + Touch
- Auto-Fire der Squad nach oben
- 5 Gate-Typen: `+N`, `×N`, `-N`, `+DMG`, `×DMG`
- 3 Gegner-Typen marschierend nach unten
- Boss pro Welle
- Wave-Counter, Squad-Count-HUD, Damage-Tier-HUD
- Menü / GameOver / Restart

## Nicht-Ziele (bewusst)

- Kein Pay-to-Win, keine Ads, keine Loot-Boxen
- Kein Base-Building, kein Strategie-Layer
- Kein Multiplayer / Backend
- Keine Hyper-Animationen — wir gehen stilisierte 2D-Sprites

## Stakeholder

- **Owner:** Danny Bergt (danny.bergt.db@googlemail.com)
- **Agent:** Claude Code

## Erfolgskriterien

- 60 FPS im Browser auf Mid-Tier-Hardware
- Look hält den Vergleich mit Last-War-Werbevideos stand (Owner-Bewertung)
- 5-Minuten-Run = mindestens 1 spürbarer Squad-Wachstums-Peak und 1 spürbarer Verlust-Tiefpunkt

## Referenzen (Genre + Look)

- **Last War: Survival Werbevideos** (Special Ops / Frontline Breakthrough — Hauptvorbild für Look + Gameplay)
- Andere Lane-Defender im Genre: Stickman Army, Crowd Master 3D, Total Battle Crowd, Tall Man Run
