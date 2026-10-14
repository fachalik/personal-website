# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS base
RUN corepack enable
WORKDIR /app

# Install dependencies only when the lockfile changes.
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Optional at build time; statically rendered pages that hit the GitHub API
# use exact counts when it is set.
ARG GITHUB_TOKEN
RUN GITHUB_TOKEN=${GITHUB_TOKEN} pnpm build

FROM base AS runner
# Lets the pre-push hook prune only this project's stale images.
LABEL org.opencontainers.image.title="fachalik-portfolio"
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  PORT=3000 \
  HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Blog posts and OG fonts are read from disk at request time.
COPY --from=builder --chown=nextjs:nodejs /app/content ./content
COPY --from=builder --chown=nextjs:nodejs /app/src/assets/fonts ./src/assets/fonts

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
