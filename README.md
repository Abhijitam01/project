# Sketchy

Realtime multiplayer whiteboard built with Next.js, Express, WebSockets, and Prisma in a Turborepo monorepo.

## Live Links
- Product: `https://your-domain.com`
- Frontend: `https://app.your-domain.com`
- HTTP API: `https://api.your-domain.com`
- WebSocket: `wss://ws.your-domain.com`

## Product Preview
### Screenshot
<!-- Replace this path with your final screenshot file -->
![Sketchy Screenshot](./docs/assets/screenshot-main.png)

### Demo Video
<!-- Option 1: YouTube/Vimeo link -->
- Demo: `https://www.youtube.com/watch?v=YOUR_VIDEO_ID`

<!-- Option 2: Local/public video file -->
- MP4: `./docs/assets/demo.mp4`

## Features
- Realtime collaborative drawing rooms
- Shape tools, text, freehand pencil, erase
- Selection, drag, resize handles, corner resize
- Zoom/pan, keyboard shortcuts, undo/redo
- Export: PNG, SVG, JSON
- Import: JSON
- Private rooms with invite code flow

## Tech Stack
- Frontend: Next.js (App Router), React, Tailwind CSS
- UI Package: shared `@repo/ui`
- HTTP Backend: Express + JWT auth
- Realtime Backend: `ws` WebSocket server
- Database: PostgreSQL + Prisma
- Monorepo: Turborepo + pnpm workspaces
- Validation: Zod
- Testing: Vitest (schema and auth coverage baseline)

## Monorepo Structure
```text
apps/
  excelidraw-frontend/    # Next.js app
  http-backend/           # REST API server
  ws-backend/             # WebSocket realtime server
packages/
  common/                 # Shared zod schemas + common utilities
  db/                     # Prisma schema/client
  ui/                     # Shared UI components
```

## Environment Variables
### Root (`.env`)
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`

### Frontend (`apps/excelidraw-frontend`)
- `NEXT_PUBLIC_HTTP_URL`
- `NEXT_PUBLIC_WS_URL`
- `NEXT_PUBLIC_ENABLE_LIVE_DEMO` (`false` to hide demo CTA)

### Backends
- `JWT_SECRET` (same value in HTTP and WS services)

## Local Development
### 1. Install
```bash
pnpm install
```

### 2. Start database
```bash
docker compose up -d
```

### 3. Run migrations
```bash
pnpm --dir packages/db prisma migrate dev
pnpm --dir packages/db prisma generate
```

### 4. Run all apps
```bash
pnpm dev
```

Default local endpoints:
- Frontend: `http://localhost:3000`
- HTTP API: `http://localhost:3001`
- WS: `ws://localhost:8080`

## Scripts
From repo root:
- `pnpm dev` - run all services in dev
- `pnpm build` - build all workspaces
- `pnpm lint` - lint all workspaces
- `pnpm test` - run baseline tests (`packages/common`, `apps/ws-backend`)

Package-level examples:
- `pnpm --dir apps/excelidraw-frontend run check-types`
- `pnpm --dir apps/excelidraw-frontend run lint`
- `pnpm --dir apps/http-backend run build`
- `pnpm --dir apps/ws-backend run build`

## Production Release
Use `RELEASE_CHECKLIST.md` as the source of truth before go-live.

Quick commands:
```bash
pnpm install
pnpm build
pnpm lint
pnpm test
pnpm --dir packages/db prisma migrate deploy
```

## API Snapshot
### HTTP
- `POST /signup`
- `POST /signin`
- `POST /room` (auth required)
- `GET /room/:roomName`
- `GET /user` (auth required)

### WebSocket Message Types
- `join_room`
- `leave_room`
- `draw`
- `erase`
- `cursor`
- `reset`
- `bulk_draw`
- `presence`

## Roadmap
- Backend integration tests for room and auth endpoints
- End-to-end collaborative room tests
- Better observability (error tracking + metrics + alerts)
- Deployment templates for Docker/K8s

## License
Set your license here.
