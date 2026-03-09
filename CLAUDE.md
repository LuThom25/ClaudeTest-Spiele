# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Git-Workflow (verpflichtend)

- **Git ist obligatorisch.** Jede Änderung wird versioniert.
- **Commit-Regel:** Sinnvolle, kleine Commits nach jedem abgeschlossenen Schritt.
- **Push-Regel:** Nach jedem wichtigen Zwischenstand wird gepusht.
- **Commit-Format:**
  - `feat: ...` — neue Funktionalität
  - `fix: ...` — Bugfix
  - `docs: ...` — Dokumentation
  - `refactor: ...` — Umstrukturierung ohne Funktionsänderung
  - `chore: ...` — Wartung, Konfiguration
- Keine Sammel-Commits, keine nichtssagenden Messages.
- Der Projektstand muss jederzeit wiederherstellbar sein.

## Branch-Struktur

| Branch           | Inhalt                        |
|------------------|-------------------------------|
| `main`           | Nur zentrale README-Übersicht |
| `hilldrive`      | Hilldrive-Projekt             |
| `shooterhtml`    | ShooterHTML-Projekt           |
| `tictactoehtml`  | TicTacToeHTML-Projekt         |
| `matrix`         | Matrix C++-Projekt            |

- `main` ist **kein Arbeits-Branch** — nur Übersicht.
- Änderungen an einem Spiel **immer im zugehörigen Branch** durchführen.
- Niemals Spielcode direkt in `main` committen.

## Sicherheit

- Keine Secrets, Tokens oder Zugangsdaten committen.
- Temporäre Dateien und OS-Artefakte (.DS_Store etc.) sind in `.gitignore` ausgeschlossen.
- Vor jedem Commit prüfen, welche Dateien tatsächlich versioniert werden.

---

## Running the Projects

This repo contains standalone browser games — no build step, no package manager.

**To run Hill Drive (Branch `hilldrive`, multi-file ES module game):**
```bash
python3 -m http.server 8080
# → open http://localhost:8080
```
ES modules require a real HTTP server (file:// won't work).

**To run single-file games (Branches `shooterhtml`, `tictactoehtml`):**
```bash
open shooter.html
open tictactoe.html
# or double-click in Finder
```
Single-file games work directly from the filesystem.

**To run Matrix (Branch `matrix`, C++ CLI project):**
```bash
cd matrix
make
./matrix
```
Requires a C++ compiler (g++ or clang++). Interactive console menu.

---

## Architecture

### Single-file games (`shooter.html`, `tictactoe.html`)
All HTML, CSS, and JS in one file. Self-contained, no imports.

### Hill Drive (`hill-drive/`)
Multi-file ES module game (Canvas 800×500, Vanilla JS, no libraries).

**Data flow:**
```
main.js (game loop + state machine)
  ├── terrain.js   → generates world geometry, queried each frame
  ├── vehicle.js   → physics update (spring-damper wheels, torque, flip detection)
  ├── entities.js  → coin/fuel spawn and collection checks
  ├── camera.js    → soft-follow, world→screen transform (toScreen)
  ├── renderer.js  → draws everything in world-space using camera.toScreen()
  └── hud.js       → draws HUD in screen-space (no camera transform)
```

**Key conventions:**
- World units are pixels; `body.x / 100` = meters displayed to user
- `camera.toScreen(wx, wy)` converts any world coordinate to canvas coordinate
- Terrain is generated lazily: `terrain.extend(x)` called each frame; appends 2000px chunks when vehicle approaches the edge
- Entities spawn lazily alongside terrain via `entities.spawnUpTo(maxX, terrain)`
- State machine lives in `main.js` as a string: `'menu'` | `'playing'` | `'gameover'`
- Physics constants (SPRING_K, GRAVITY, ENGINE_FORCE, etc.) are at the top of `vehicle.js`

### Matrix (`matrix/`)
C++ CLI-Projekt mit interaktivem Menü. Kein Browser, kein Server.

**Struktur:**
```
matrix/
  ├── include/Matrix.h   → Klassendeklaration
  ├── src/Matrix.cpp     → Implementierung (alle Operationen)
  ├── src/main.cpp       → Interaktives Konsolenmenü
  └── Makefile           → Build-System
```

**Unterstützte Operationen:** Addition, Subtraktion, Multiplikation, Transposition, Determinante (rekursiv), Inverse (Gauß-Jordan).
