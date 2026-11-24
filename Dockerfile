# syntax=docker/dockerfile:1
# Two images from one Dockerfile:
#   --target runner  → the web app (Next.js standalone server), the default
#   --target tools   → Prisma CLI + scripts, for migrations/seed as a Container Apps job

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-slim AS deps
WORKDIR /app
# Prisma CLI needs OpenSSL to detect the platform
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src/lib/db-config.ts ./src/lib/db-config.ts
# postinstall runs `prisma generate`
RUN npm ci --no-audit --no-fund

FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

# ── Migrations / seed / admin scripts ────────────────────────────────────────
FROM deps AS tools
COPY . .
RUN npx prisma generate
USER node
CMD ["npx", "prisma", "migrate", "deploy"]

# ── Web app ──────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
