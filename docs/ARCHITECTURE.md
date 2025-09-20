# Architecture

## Overview

- Frontend: Vite + React + TypeScript (`Panel/src`), built to `Panel/dist`.
- Backend: FastAPI (`Panel/panel_backend_production.py`) running on Uvicorn port 9001.
- Static serving: Backend serves the SPA from `Panel/dist` at `/` and assets under `/assets`.
- Optional integrations: `mevzuat-gov-scraper` and `Mevzuat-System` modules used by backend tools.

## Key Entry Points

- App: `Panel/panel_backend_production.py` exposes `app` for Uvicorn.
- Dev Frontend: `Panel/npm run dev` (port 5175; proxy to 9001 if configured).

## Health & Observability

- Health: `/health/production`
- Stats: `/api/stats/production`
- Swagger: `/docs`

## Logs (Windows)

- Backend logs: `Panel/panel_backend.prod.log`, errors: `Panel/panel_backend.prod.err.log`

## Ports

- 9001: Backend + SPA
- 5175: Vite dev server (optional during development)

## Deployment

- Single Docker image builds frontend and runs backend. See `DEPLOY_COOLIFY.md` for details.
