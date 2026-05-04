# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

LIF Energy Marketing Hub — a campaign management dashboard. Monorepo with two independently served apps:

- **`/front-end`** — React 18 + Vite SPA (port 5173)
- **`/api`** — Node.js + Express + MongoDB REST API (port 4000)

No linting or test framework in place.

## Commands

### Frontend (`/front-end`)
```
npm run dev      # dev server with hot reload
npm run build    # production build → dist/
npm run preview  # preview production build
```

### Backend (`/api`)
```
npm run dev   # nodemon-watched dev server
npm start     # direct node (production)
```

Both apps must run simultaneously in development. MongoDB must be running locally or `MONGODB_URI` in `api/.env` must point to a remote instance.

## Architecture

### Frontend

**Entry:** `src/main.jsx` → `src/App.jsx` (router + providers)

**State:** Two React Contexts, no Redux:
- `AuthContext` — JWT token (persisted in `localStorage['mhub-auth-token']`), user object, login/logout
- `AppContext` — campaigns list, modal state (create/edit), confirm dialog, toast stack

**API Client:** `src/api/client.js` — Axios instance with two interceptors:
1. Request: attaches `Authorization: Bearer <token>` from localStorage
2. Response: on 401, triggers logout + redirect to `/login`

**Polling:** `useItems` hook (inside AppContext) fetches campaigns on mount, then polls every `VITE_POLL_INTERVAL` ms (default 10000). Uses `fetchingRef` to prevent overlapping requests and `mountedRef` to prevent state updates after unmount.

**Normalization:** Raw API responses are transformed via `normalizeItem()` before being stored in context (uppercase title, coordinate coercion, defaults).

**Protected routes:** `PrivateRoute` checks for token; redirects to `/login` if absent. All non-login routes are protected and wrapped in `AppProvider`.

### Backend

**Entry:** `src/server.js` → `src/app.js`

**Structure:** Routes → Controllers → Models (Mongoose)

**Auth:** JWT in `Authorization: Bearer` header, verified by `auth.middleware.js`. Attaches user to `req.user`. Unprotected: `GET /api/health`.

**Endpoints:**
- `/api/auth` — register, login, user management
- `/api/items` — campaign CRUD (filtered by query params)
- `/api/orders` — order tracking

## Key Conventions

**Spanish naming throughout:** DB fields and many JS variables use Spanish — `titulo`, `categoria`, `estado`, `fecha`, `hora`, `precio`, `latitud`, `longitud`, `correo`, `obs`.

**Campaign categories:** `['Influencer', 'Publicidad', 'Eventos', 'RRSS', 'Otras']`

**Campaign states:** `['EN IDEA', 'ACTIVA', 'PAUSADA', 'CANCELADA', 'REALIZADA']`

**Colors and enums** live in `front-end/src/utils/categories.js`.

**Formatters** in `front-end/src/utils/formatters.js`:
- `money(n)` → CLP currency string
- `moneyCompact(n)` → `$XM` / `$XK` / `$X`
- `fDate(str)` → `DD/MM/YYYY`
- `daysAway(str)` → `"Hoy"`, `"Mañana"`, `"En Xd"`, `"Hace Xd"`

**Geolocation:** `CampaignModal` integrates a Leaflet map for location picking + OpenStreetMap Nominatim geocoding (restricted to Argentina and Chile via `countrycodes: ar,cl`).

**Component pattern:** Pages hold data/logic from context; components are presentational. Overlays (Modal, ConfirmDialog, Toast) render into `document.body` via portals.

## Environment Variables

**`front-end/.env`:**
```
VITE_API_BASE=https://lif-mkt-db.onrender.com/api
VITE_POLL_INTERVAL=10000
```

**`api/.env`:**
```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/lif-mkt-dashboard
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d
```
