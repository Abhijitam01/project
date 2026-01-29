FROM node:20-alpine AS base
RUN npm install -g pnpm turbo
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install
RUN turbo build --filter=excelidraw-frontend

FROM base AS runner
COPY --from=builder /app/apps/excelidraw-frontend/public ./apps/excelidraw-frontend/public
COPY --from=builder /app/apps/excelidraw-frontend/.next ./apps/excelidraw-frontend/.next
COPY --from=builder /app/apps/excelidraw-frontend/package.json ./apps/excelidraw-frontend/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["pnpm", "start", "--filter", "excelidraw-frontend"]

