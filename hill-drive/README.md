# Hilldrive

Physik-basiertes Hügelfahrspiel mit HTML5 Canvas (800×500px).
Vanilla JS, keine externen Bibliotheken.

## Starten

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

> ES-Module erfordern einen echten HTTP-Server. `file://` funktioniert nicht.

## Steuerung

| Taste | Aktion |
|-------|--------|
| `→` / `D` | Gas geben |
| `←` / `A` | Rückwärts |
| `R` | Fahrzeug aufrichten |

## Projektstruktur

```
hill-drive/
├── index.html
├── style.css
└── src/
    ├── main.js       # Game Loop + State Machine
    ├── terrain.js    # Terrain-Generierung (lazy, 2000px Chunks)
    ├── vehicle.js    # Physik (Federn, Dämpfer, Drehmoment)
    ├── entities.js   # Coins & Fuel
    ├── camera.js     # Soft-Follow Kamera
    ├── renderer.js   # Rendering in World-Space
    └── hud.js        # HUD in Screen-Space
```
