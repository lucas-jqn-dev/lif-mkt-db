# LIF Energy — Marketing Hub

React dashboard for managing LIF Energy marketing campaigns.

## Tech Stack

- **React 18** (functional components + hooks)
- **Vite** (build tool / dev server)
- **React Router v6** (page routing)
- **Axios** (HTTP client with auth interceptors)
- **React-Leaflet** (interactive maps)
- No Redux — state via React Context + hooks only

## Pages

| Route | Description |
|---|---|
| `/login` | Authentication |
| `/dashboard` | KPI cards, spend charts, pending campaigns |
| `/timeline` | Upcoming campaigns filtered by date range |
| `/map` | Leaflet map of active campaigns |
| `/all` | Sortable/filterable full campaign table |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_BASE=https://lif-mkt-db.onrender.com/api
VITE_POLL_INTERVAL=10000
```

- `VITE_API_BASE` — backend API URL
- `VITE_POLL_INTERVAL` — auto-refresh interval in milliseconds (default: 10000 = 10s)

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for production

```bash
npm run build
npm run preview   # preview the production build
```

## Project Structure

```
src/
├── api/
│   └── client.js          # Axios instance + auth interceptors + API methods
├── context/
│   ├── AuthContext.jsx     # Token/user state, login/logout
│   └── AppContext.jsx      # Items, modal, confirm dialog, toasts
├── hooks/
│   └── useItems.js         # Polling hook (fetch + setInterval cleanup)
├── pages/
│   ├── AuthPage.jsx
│   ├── DashboardPage.jsx
│   ├── TimelinePage.jsx
│   ├── MapPage.jsx
│   └── AllPage.jsx
├── components/
│   ├── Layout/
│   │   ├── AppLayout.jsx   # Shell: sidebar + outlet + global overlays
│   │   └── Sidebar.jsx
│   ├── CampaignModal.jsx   # Create / edit form with location picker
│   ├── ConfirmDialog.jsx
│   └── Toast.jsx
├── utils/
│   ├── formatters.js       # money(), fDate(), daysAway()
│   └── categories.js       # Constants, class helpers, color maps
└── styles/
    └── globals.css
```

## Polling

Auto-refresh is implemented in `useItems.js` using `setInterval` with proper cleanup on unmount. A `fetchingRef` prevents overlapping requests if a previous fetch is still pending.

```js
// Configurable via .env
VITE_POLL_INTERVAL=10000   # 10 seconds
```

## Authentication

Token stored in `localStorage` (`mhub-auth-token`). The Axios request interceptor attaches it to every request. A 401 response automatically redirects to `/login` and clears stored credentials.
