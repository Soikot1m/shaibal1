# syntax=docker/dockerfile:1
# ------------------------------------------------------------------------------
# Shaibal Tours & Travels — production image
# Works on any VPS (docker compose), Railway, Render, Fly.io, etc.
# Runtime env required: DATABASE_URL, NEXT_PUBLIC_SITE_URL
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- dependencies -------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- build --------------------------------------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public URL is baked into a few build-time values (server-action origins etc.)
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG ALLOWED_ORIGINS=
# Placeholder only: every page is server-rendered on demand, so no database
# query runs during `next build`. The real DATABASE_URL is supplied at runtime.
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    ALLOWED_ORIGINS=$ALLOWED_ORIGINS \
    DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
RUN npm run build

# ---- runtime ------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app ./
RUN chmod +x scripts/docker-entrypoint.sh
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["sh", "scripts/docker-entrypoint.sh"]
