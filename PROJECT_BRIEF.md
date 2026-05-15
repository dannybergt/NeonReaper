# NeonReaper — Project Brief

> **2026-05-15 — Visual-Pivot.** Der ursprüngliche Neon-Noir-Stil aus ADR-001 wurde durch ADR-007 widerrufen. Setting ist jetzt post-apokalyptisch im Polish-Look der **Last War: Survival**-Mobile-Ads (Soldat vs Zombie-Horden, gedämpfte Erdtöne + warme Akzente). Projekt-Name bleibt vorerst "NeonReaper" als Codename bis ein neuer Brand-Name entschieden ist.

## Pitch in einem Satz

NeonReaper ist ein top-down Survivor-Auto-Shooter im Polish-Look der Last-War-Werbevideos: Soldat gegen Zombie-Horden, kombinierbare Waffen, sichtbar werdende Stärke- und Schwächephasen — also genau das, was Google-Play-Ads versprechen und nie liefern.

## Ziel

Ein optisch hochwertiges Spiel bauen, das dem entspricht, was Mobile-Ads im Genre (Last Z: Survival Shooter, Last War: Survival, Survivor.io) suggerieren, aber nicht halten:

- klare, sichtbare Progression
- echte Waffenkategorien mit eigenen Mechaniken (nicht nur "DPS+10%")
- ansprechende Bewegung, Treffer-Feedback, Partikel, Postprocessing
- Stärke kann steigen **und** sinken — Spannungsbogen statt linearer Powercreep

## Plattformen (Reihenfolge)

1. **Browser** (Desktop + Mobile-Browser) — Prototyp, schnelle Iteration
2. **Android** — Capacitor-Wrap des gleichen Builds, native Wrapper
3. Optional später: iOS, Steam (Electron / Tauri)

## Scope MVP (erste spielbare Slice)

- 1 Charakter, 1 Map, 1 Run = 15 min
- 3 Gegner-Typen (Walker, Runner, Brute) + 1 Boss
- 4 Waffenkategorien (Pistol, Shotgun, Drone, Plasma)
- Auto-Aim mit "nearest enemy"-Heuristik
- XP, Level-Up-Pickup mit 3 Upgrades zur Auswahl
- 1 Stärke-Senkungs-Mechanik ("Overheat" — siehe ARCHITECTURE)
- Pause, Death-Screen, Restart
- Score + Runtime tracking lokal (localStorage)

## Nicht-Ziele (bewusst)

- Kein Pay-to-Win, keine Ads, keine Loot-Boxen, keine F2P-Monetarisierung im MVP
- Kein Online-Multiplayer
- Kein Account-System / kein Server-Backend im MVP
- Kein Base-Building (das ist Last-War-Mechanik, anderes Genre)
- Kein Realismus-Render — wir gehen stilisiert, das ist günstiger und altert besser

## Stakeholder

- **Owner:** Danny Bergt (danny.bergt.db@googlemail.com)
- **Agent:** Claude Code (Senior Engineer / Architect / DevSecOps)

## Erfolgskriterien

- **MVP-Demo läuft fluide (60 FPS) im Browser auf Mid-Tier-Hardware**
- **Look hält dem Vergleich mit Werbevideos der Genre-Referenzen stand** (subjektive Bewertung durch Owner)
- **5-Minuten-Demo überzeugt einen unbedarften Tester, dass sich ein Run lohnt**

## Referenzen (Genre + Look)

- Survivor.io (Mechanik-Goldstandard für Auto-Shooter)
- Vampire Survivors (Originator des Genres)
- Last Z: Survival Shooter (Werbe-Look, den User explizit will)
- Last War: Survival Game (visuelle Polish-Referenz)
- Hades (Iso-Look + Postprocessing als Inspiration)
