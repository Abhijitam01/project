FROM node:20-alpine AS base
RUN npm install -g pnpm turbo
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install
RUN turbo build --filter=ws-backend

FROM base AS runner
COPY --from=builder /app/apps/ws-backend/dist ./apps/ws-backend/dist
COPY --from=builder /app/apps/ws-backend/package.json ./apps/ws-backend/package.json
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080
CMD ["pnpm", "start", "--filter", "ws-backend"]
