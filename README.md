# Incident Fetcher

A web app that fetches the live Florida Highway Patrol (FHP) CAD incident feed and plots active incidents on an interactive Leaflet map. Each incident is decoded from its FHP signal code (e.g. `S4I` → "Vehicle crash w/injuries") and displayed with a marker icon matching the incident type.

## Features

- Live data from the [FHP CAD RSS feed](https://trafficincidents.flhsmv.gov/SmartWebClient/CADrss.aspx)
- Full FHP signal code lookup table (S0–S99C)
- Distinct map markers for vehicle crashes, fires, road obstructions, disabled vehicles, and critical incidents
- Marker clustering via [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) so dense areas (I-95, Orlando, Miami) stay readable
- On-map legend (via [Leaflet.Legend](https://github.com/ptma/Leaflet.Legend)) showing what each marker icon represents
- Centers on the user's location (with permission) or falls back to FHP HQ in Tallahassee
- Persists last-viewed map center and zoom in `localStorage` so the view restores across reloads
- Optional user-location marker shown only when geolocation succeeds
- Responsive header that collapses the back-to-PatrolWave link and title on narrow viewports
- Popups with incident name, location, county, and dispatch remarks

## Tech Stack

- **Backend:** Node.js, Express 5, [`rss-parser`](https://www.npmjs.com/package/rss-parser)
- **Frontend:** Vanilla JS, [Leaflet](https://leafletjs.com/), [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster), [Leaflet.Legend](https://github.com/ptma/Leaflet.Legend), OpenStreetMap tiles

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install

```bash
npm install
```

### Run

```bash
# development (auto-restart with nodemon)
npm run dev

# production
npm start
```

Then open http://localhost:3000.

The server listens on `PORT` from the environment, defaulting to `3000`.

## API

### `GET /incidents`

Returns the current FHP CAD feed as JSON. Each incident has the shape:

```json
{
  "title": "...",
  "cadDate": "...",
  "dispatchedTime": "...",
  "arrivedTime": "...",
  "incidentType": "S4I",
  "incidentName": "Vehicle crash w/injuries",
  "location": "...",
  "district": "...",
  "city": "...",
  "county": "...",
  "latitude": "...",
  "longitude": "...",
  "remarks": "..."
}
```

## Project Structure

```
.
├── server.js                       Express server + /incidents endpoint
├── index.html                      Map page
├── public/
│   ├── css/
│   │   ├── style.css               Header, footer, and responsive layout styles
│   │   ├── MarkerCluster.css       Leaflet.markercluster base styles
│   │   ├── MarkerCluster.Default.css  Default cluster theme
│   │   └── leaflet.legend.css      Legend control styles
│   ├── js/
│   │   ├── script.js               Leaflet map, geolocation, and incident rendering
│   │   ├── leaflet.markercluster.js  Marker clustering plugin
│   │   └── leaflet.legend.js       Legend control plugin
│   └── images/                     Marker icons and logo
└── package.json
```

## Data Source

Data is sourced from the public Florida Department of Highway Safety and Motor Vehicles (FLHSMV) CAD RSS feed. This project is not affiliated with or endorsed by the FLHSMV or the Florida Highway Patrol.

## License

[MIT](LICENSE) © Ethan Rubenstein
