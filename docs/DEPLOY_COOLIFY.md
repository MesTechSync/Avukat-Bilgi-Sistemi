# Deploy on Coolify

This repository is configured to deploy a single Docker image that builds the frontend and runs the FastAPI backend.

## Prerequisites

- A Coolify instance with Docker runners
- A domain pointing to Coolify (e.g., `avukat-bilgi-sistemi.hidlightmedya.tr`)

## Steps

1. Create a new Application in Coolify
   - Source: GitHub (connect the `MesTechSync/Avukat-Bilgi-Sistemi` repository)
   - Branch: `main`
   - Buildpack/Type: Docker
   - Dockerfile path: `Dockerfile` (repo root)
2. Expose Port
   - Internal container port: 9001
   - Public HTTP port will be auto-exposed by Coolify with your domain
3. Environment Variables (optional)
   - You can provide additional backend env vars via Coolify UI
4. Deploy
   - Click Deploy; Coolify will run multi-stage build and start Uvicorn at port 9001

## Verify

- SPA: `https://avukat-bilgi-sistemi.hidlightmedya.tr/`
- API Docs: `https://avukat-bilgi-sistemi.hidlightmedya.tr/docs`
- Health: `https://avukat-bilgi-sistemi.hidlightmedya.tr/health/production`

## Troubleshooting

- If build fails on `lxml`, ensure build tools and headers are present (Dockerfile includes them)
- For Python dependency changes, update `Panel/requirements.txt`
- For frontend changes, ensure `npm ci` and `npm run build` succeed locally
