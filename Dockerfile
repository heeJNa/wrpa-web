# Base
FROM node:22-alpine AS base
RUN corepack enable && npm install -g pm2
WORKDIR /app

# # Dependencies caching
# FROM base AS deps
# COPY pnpm-lock.yaml package.json ./
# RUN pnpm fetch

# Build
FROM base AS build
COPY --from=deps /app /app
COPY . .
RUN pnpm install
RUN pnpm build

# Runtime
FROM node:22-alpine AS runtime
RUN corepack enable && npm install -g pm2
WORKDIR /app
COPY --from=build /app/.output /app/.output
COPY ecosystem.config.cjs ./
EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.cjs", "--update-env"]