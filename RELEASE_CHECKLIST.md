# Release Checklist

## 1. Environment Setup

### Root `.env`
- [ ] `DATABASE_URL` is set for production database
- [ ] `JWT_SECRET` is strong and not default
- [ ] `NODE_ENV=production`

### Frontend (`apps/excelidraw-frontend`)
- [ ] `NEXT_PUBLIC_HTTP_URL` points to deployed HTTP API (HTTPS)
- [ ] `NEXT_PUBLIC_WS_URL` points to deployed WS endpoint (WSS)

### Backends
- [ ] `JWT_SECRET` is identical across HTTP + WS backends
- [ ] Any service-level env vars are configured in hosting dashboard

## 2. Install and Build

Run from repo root:

```bash
pnpm install
pnpm build
```

- [ ] Monorepo build succeeds without warnings/errors

## 3. Database and Prisma

Run from repo root:

```bash
pnpm --dir packages/db prisma migrate deploy
pnpm --dir packages/db prisma generate
```

Optional verification:

```bash
pnpm --dir packages/db prisma studio
```

- [ ] Migrations applied in production
- [ ] Prisma client generated successfully

## 4. Quality Gates (CI)

Run from repo root:

```bash
pnpm lint
pnpm --dir apps/excelidraw-frontend run check-types
pnpm --dir packages/ui run check-types
pnpm --dir apps/http-backend run build
pnpm --dir apps/ws-backend run build
```

- [ ] All lint checks pass
- [ ] All type checks pass
- [ ] Both backends compile

## 5. Deploy Services

### Frontend

```bash
pnpm --dir apps/excelidraw-frontend run build
pnpm --dir apps/excelidraw-frontend run start
```

### HTTP Backend

```bash
pnpm --dir apps/http-backend run build
pnpm --dir apps/http-backend run start
```

### WS Backend

```bash
pnpm --dir apps/ws-backend run build
pnpm --dir apps/ws-backend run start
```

- [ ] Frontend serves production build
- [ ] HTTP backend is reachable
- [ ] WS backend accepts socket connections

## 6. Infrastructure and Security

- [ ] Domain + TLS configured for frontend and APIs
- [ ] WSS upgrade works behind proxy/load balancer
- [ ] CORS restricted to production frontend domain
- [ ] Rate limiting enabled on auth + room endpoints
- [ ] Secure headers enabled (`helmet` or proxy equivalent)
- [ ] Logs and sensitive data redaction configured

## 7. Smoke Tests (Production)

- [ ] Sign up and sign in
- [ ] Create room and join room
- [ ] Multi-user real-time drawing sync works
- [ ] Pointer selection works (hover, move, resize handles)
- [ ] Undo/redo works
- [ ] Export/import (PNG/SVG/JSON) works
- [ ] Share link and invite flow works

## 8. Monitoring and Rollback

- [ ] Error tracking configured (e.g. Sentry)
- [ ] Uptime checks configured for frontend + APIs
- [ ] Basic dashboards/alerts in place
- [ ] DB backup + restore procedure verified
- [ ] Rollback plan documented (previous image/release)

## 9. Go / No-Go

Go live only if all are true:
- [ ] Build green
- [ ] Lint/type green
- [ ] Migrations applied
- [ ] Smoke tests passed
- [ ] Monitoring active
- [ ] Rollback ready
