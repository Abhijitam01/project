# Draw-App Monorepo

This project is a real-time multiuser drawing application built with Next.js, Express, and WebSockets.

## Prerequisites

1. **Node.js**: Version 18 or higher.
2. **Docker**: For running the database (PostgreSQL).
3. **Package Manager**: `pnpm` is recommended.

## Getting Started

To run the entire application (frontend and both backends) simultaneously, follow these steps:

### 1. Start the Database

The project includes a `docker-compose.yml` to quickly start a PostgreSQL database.

From the root directory:

```bash
docker-compose up -d
```

**If you get a `KeyError: 'ContainerConfig'` or other errors**, use this fallback command to start the database manually:

```bash
docker run -d --name drawr-db -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_USER=postgres -e POSTGRES_DB=drawr postgres:15-alpine
```

### Stopping/Canceling Containers

To stop the database and other running containers:

- **Using Compose**: `docker-compose down`
- **Force Stop All Containers**: `docker stop $(docker ps -aq)`
- **Remove All Containers**: `docker rm $(docker ps -aq)`
- **Stop specifically the DB**: `docker stop drawr-db`

### 2. Install Dependencies

From the root directory:

```bash
pnpm install
```

### 2. Configure Environment Variables

Ensure you have a `.env` file in the root with the following:

- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A secret string for authentication.

### 3. Database Setup

Ensure the database schema is up to date:

```bash
cd packages/db
pnpm prisma migrate dev
```

### 4. Run Everything

From the root directory, run the development server:

```bash
pnpm dev
```

This will concurrently start:

- **Frontend**: http://localhost:3000 (Next.js)
- **HTTP Backend**: http://localhost:8080 (Express)
- **WS Backend**: WebSocket server for real-time collaboration.

## Database Management

### Subsequent Migrations

Whenever you update the `packages/db/prisma/schema.prisma` file, you need to apply the changes:

1. **Apply Changes**:
   ```bash
   cd packages/db
   pnpm prisma migrate dev
   ```
   This will create a new migration file and update your database schema.

### Viewing the Database

You can use **Prisma Studio** to view and edit your data in a web interface:

```bash
cd packages/db
pnpm prisma studio
```

This will open a dashboard at http://localhost:5555 where you can explore your tables and records.

## Individual Services

If you need to run services individually:

- **Frontend**: `cd apps/excelidraw-frontend && pnpm dev`
- **HTTP Backend**: `cd apps/http-backend && pnpm dev`
- **WS Backend**: `cd apps/ws-backend && pnpm dev`
