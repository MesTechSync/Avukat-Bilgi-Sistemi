# Multi-stage build: build React (Vite) frontend, then run FastAPI backend serving built SPA

# 1) Frontend build stage
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy only Panel assets necessary for build
COPY Panel/package*.json Panel/
WORKDIR /app/Panel
RUN npm ci

COPY Panel/ /app/Panel/
RUN npm run build

# 2) Python backend stage
FROM python:3.11-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps for lxml (and build tools in case wheels not available)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libxml2-dev \
       libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY Panel/requirements.txt /app/Panel/requirements.txt
RUN pip install --upgrade pip \
    && pip install -r /app/Panel/requirements.txt

# Copy repository (only what we need at runtime)
COPY Panel/ /app/Panel/
COPY mevzuat-gov-scraper/ /app/mevzuat-gov-scraper/
COPY Mevzuat-System/ /app/Mevzuat-System/

# Copy built frontend from builder
COPY --from=frontend-builder /app/Panel/dist/ /app/Panel/dist/

EXPOSE 9001

WORKDIR /app/Panel

# Default command: run uvicorn with the production app
CMD ["uvicorn", "panel_backend_production:app", "--host", "0.0.0.0", "--port", "9001", "--workers", "1"]
