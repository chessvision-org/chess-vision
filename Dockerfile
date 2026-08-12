# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app
ENV CI=true
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN corepack prepare --activate

FROM base AS deps
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS runtime
COPY . .
EXPOSE 3001
CMD ["pnpm", "start"]
