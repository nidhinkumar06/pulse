# ── Build stage ───────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
COPY prisma/ ./prisma/

RUN bun install --frozen-lockfile

# Generate Prisma client for the container's OS/arch
RUN bunx prisma generate

COPY tsconfig.json ./
COPY src/ ./src/

RUN bun run build

# ── Production stage ───────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS production

WORKDIR /app

RUN apk add --no-cache tini nodejs npm

RUN apk add --no-cache tini

COPY package.json bun.lock ./
COPY prisma/ ./prisma/

# Install production deps only
RUN bun install --frozen-lockfile --production

# Re-generate Prisma client in production image
RUN bunx prisma generate

# Pre-install all MCP server packages so they don't download at runtime
RUN npm install -g \
  @modelcontextprotocol/server-filesystem \
  @notionhq/notion-mcp-server

COPY --from=builder /app/dist ./dist

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Run migrations then start — prisma migrate deploy is idempotent
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["bun", "dist/index.js"]