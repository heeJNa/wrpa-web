# build 단계에서 Node 22 사용
# Base stage
FROM node:22-alpine AS base
RUN corepack enable  # pnpm 사용 가능하도록 설정
WORKDIR /app

# Dependencies caching
FROM base AS deps
COPY pnpm-lock.yaml package.json ./
RUN pnpm fetch --frozen-lockfile  # 의존성 캐시 / 빌드 최적화  [oai_citation:0‡pnpm.io](https://pnpm.io/docker?utm_source=chatgpt.com) [oai_citation:1‡Depot](https://depot.dev/docs/container-builds/how-to-guides/optimal-dockerfiles/node-pnpm-dockerfile?utm_source=chatgpt.com)

# Build stage
FROM base AS build
COPY --from=deps /app /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Production runtime
FROM keymetrics/pm2:latest-alpine
WORKDIR /app
COPY --from=build /app/.output ./
COPY ecosystem.config.cjs ./
EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.cjs"]