# Fitnesspark Luzern — Besuchertracker

Live-Besucherzahlen der Fitnessparks **Luzern National** und **Luzern Allmend** mit farbcodierter Bewertung und Wochenmatrix-Heatmap.

## Features

- **Echte Live-Daten** von fitnesspark.ch (via lokaler CORS-Proxy)
- **Farbcodierte Besucherkarten** — Grün (<90), Amber (90–120), Rot (>120)
- **Wochenmatrix-Heatmap** — Durchschnittswerte pro Wochentag/Stunde (Mo–So, 06:00–23:00)
- **Pull-to-Refresh** auf Mobile, Klick auf Desktop
- **localStorage-Persistenz** — Daten bleiben über Sessions erhalten
- **Responsive Design** basierend auf shadcn/ui Design Tokens
- **Keine Abhängigkeiten** — reines Node.js, kein npm install nötig

## Schnellstart

```bash
node server.js
```

Öffne [http://localhost:3000](http://localhost:3000)

## Wie es funktioniert

### Architektur

```
Browser (index.html)
  │
  │  fetch('/api/visitors')
  ▼
server.js (Node.js, Port 3000)
  │
  │  HTTPS GET (kein CORS nötig serverseitig)
  ▼
fitnesspark.ch WordPress-API
  ├─ park_id=690  → National
  └─ park_id=6778 → Allmend
```

### API-Endpunkte

Die Besucherzahlen stammen von der WordPress-AJAX-API auf fitnesspark.ch:

| Park | URL |
|------|-----|
| National | `admin-ajax.php?action=single_park_update_visitors&park_id=690&location_id=54&location_name=FP_National_Luzern` |
| Allmend | `admin-ajax.php?action=single_park_update_visitors&park_id=6778&location_id=56&location_name=FP_Allmend_Luzern` |

Response: Plain-Text Zahl (z.B. `147`)

Da die API keine CORS-Header sendet, leitet `server.js` die Anfragen als Proxy weiter.

### Bewertungssystem

| Besucher | Bewertung | Farbe |
|----------|-----------|-------|
| < 90 | Super, let's go! | Grün |
| 90 – 120 | Geht noch | Amber |
| > 120 | Zu viele Leute | Rot |

### Datenstruktur (localStorage)

Pro Park wird ein Array von Messungen gespeichert:

```json
[
  { "t": "2026-04-02T17:30:00.000Z", "v": 147 },
  { "t": "2026-04-02T18:30:00.000Z", "v": 132 }
]
```

Die Wochenmatrix aggregiert alle Einträge nach Wochentag + Stunde und zeigt den Durchschnitt.

## Deployment

### Vercel (empfohlen)

Das Projekt ist Vercel-ready. Die Datei `api/visitors.js` ist eine Serverless Function, die als CORS-Proxy dient. Einfach das Repo mit Vercel verbinden — fertig.

### Lokal

```bash
node server.js
# → http://localhost:3000
```

## Lizenz

MIT
