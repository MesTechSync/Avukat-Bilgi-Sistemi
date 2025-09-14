FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY Panel/package.json Panel/package-lock.json* ./
RUN npm install

# Copy source code
COPY Panel/ ./

# Build with environment variables (if provided)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_BACKEND_URL
ARG VITE_COMMIT_SHA
ARG VITE_BUILD_TIME

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_COMMIT_SHA=$VITE_COMMIT_SHA
ENV VITE_BUILD_TIME=$VITE_BUILD_TIME

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx configuration (with simple health endpoint)
ARG SERVER_NAME=localhost
RUN echo "server {\n  listen 80;\n  server_name ${SERVER_NAME} localhost;\n  location / {\n    root /usr/share/nginx/html;\n    index index.html;\n    try_files $uri $uri/ /index.html;\n  }\n  location = /health {\n    add_header Content-Type text/plain;\n    return 200 'ok';\n  }\n  add_header X-Frame-Options 'SAMEORIGIN' always;\n  add_header X-Content-Type-Options 'nosniff' always;\n  add_header X-XSS-Protection '1; mode=block' always;\n}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
