FROM node:20-alpine AS base
RUN npm install -g pnpm turbo
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install
RUN turbo build --filter=http-backend

FROM base AS runner
COPY --from=builder /app/apps/http-backend/dist ./apps/http-backend/dist
COPY --from=builder /app/apps/http-backend/package.json ./apps/http-backend/package.json
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/common ./packages/common
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001
CMD ["pnpm", "start", "--filter", "http-backend"]
