###############################
# Stage 1 - Build Panel (Vite)
###############################
FROM node:20-alpine AS panel-builder

WORKDIR /app/Panel

# Install Panel dependencies
COPY Panel/package.json Panel/package-lock.json* ./
RUN npm ci --no-audit --prefer-offline

# Copy Panel source
COPY Panel/ ./

# Build with optional envs
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_BACKEND_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

########################################
# Stage 2 - Runtime with Node/Express
########################################
FROM node:20-alpine AS runtime

ENV NODE_ENV=production \
    PORT=8000 \
    HOST=0.0.0.0 \
    ENABLE_VITE=0

# Create app directory
WORKDIR /app/server

# Install server dependencies first (better layer cache)
COPY server/package.json server/package-lock.json* ./
RUN npm ci --omit=dev --no-audit --prefer-offline

# Copy server source
COPY server/ ./

# Copy built Panel into expected path (../Panel/dist relative to server.js)
COPY --from=panel-builder /app/Panel/dist /app/Panel/dist

# Healthcheck for orchestrators (Coolify can also use /health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

EXPOSE 8000
CMD ["node", "server.js"]
