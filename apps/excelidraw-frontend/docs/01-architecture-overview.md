# Architecture Overview

## High-Level System Design

Excelidraw is a real-time collaborative drawing application built with Next.js and TypeScript. The application follows a client-server architecture with WebSocket connections for real-time collaboration.

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Next.js Frontend (Port 3000)                   │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │  Landing Page│  │ Auth Pages   │  │  Canvas/Room    │  │ │
│  │  │  (Homepage)  │  │ (Sign In/Up) │  │  (Drawing)      │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │ │
│  │         │                 │                    │           │ │
│  │         └─────────────────┴────────────────────┘           │ │
│  │                          │                                 │ │
│  │                          ▼                                 │ │
│  │            ┌──────────────────────────┐                    │ │
│  │            │   React Components        │                   │ │
│  │            │  • Hero, Features, etc    │                   │ │
│  │            │  • Toolbar, Sidebar       │                   │ │
│  │            │  • Canvas                 │                   │ │
│  │            └──────────────────────────┘                    │ │
│  │                          │                                 │ │
│  │                          ▼                                 │ │
│  │            ┌──────────────────────────┐                    │ │
│  │            │   Game Engine (Canvas)   │                    │ │
│  │            │  • Shape Rendering       │                    │ │
│  │            │  • Mouse Event Handling  │                    │ │
│  │            │  • Drawing Logic         │                    │ │
│  │            └──────────────────────────┘                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          │           │                          │
│                          │           │                          │
└──────────────────────────┼───────────┼──────────────────────────┘
                           │           │
                      HTTP │           │ WebSocket
                      :3001│           │ :8080
                           │           │
                           ▼           ▼
                    ┌──────────────────────────┐
                    │   Backend Services        │
                    │                           │
                    │  ┌────────────────────┐   │
                    │  │  HTTP Backend      │   │
                    │  │  (Express/Node)    │   │
                    │  │  • Auth            │   │
                    │  │  • Room Management │   │
                    │  │  • User API        │   │
                    │  └────────────────────┘   │
                    │                           │
                    │  ┌────────────────────┐   │
                    │  │  WebSocket Server  │   │
                    │  │  • Real-time sync  │   │
                    │  │  • Drawing events  │   │
                    │  │  • Collaboration   │   │
                    │  └────────────────────┘   │
                    │                           │
                    │  ┌────────────────────┐   │
                    │  │  Database          │   │
                    │  │  • User data       │   │
                    │  │  • Room data       │   │
                    │  │  • Shape storage   │   │
                    │  └────────────────────┘   │
                    └──────────────────────────┘
```

## Component Architecture

The frontend is organized into several key architectural layers:

### 1. **Presentation Layer** (Pages & Routes)

- **Landing Page** (`app/page.tsx`) - Marketing and onboarding
- **Authentication** (`app/signin`, `app/signup`) - User login/registration
- **Dashboard** (`app/dashboard`) - User workspace overview
- **Room/Canvas** (`app/room/[roomName]`) - Collaborative drawing space

### 2. **Component Layer**

Components are divided into:

**Landing Page Components:**

- `Hero.tsx` - Main hero section with CTA
- `Features.tsx` - Feature showcase
- `Stats.tsx` - Platform statistics
- `Testimonials.tsx` - User reviews
- `Pricing.tsx` - Pricing tiers
- `FAQ.tsx` - Frequently asked questions
- `CTA.tsx` - Call-to-action section
- `Footer.tsx` - Footer navigation
- `Navbar.tsx` - Navigation bar

**Canvas Components:**

- `Canvas.tsx` - Main canvas wrapper
- `RoomCanvas.tsx` - Room-specific canvas with WebSocket
- `Toolbar.tsx` - Drawing tool selector
- `Sidebar.tsx` - Style and property controls
- `ToolButton.tsx` - Individual tool buttons
- `Scale.tsx` - Zoom indicator

**UI Components** (`components/ui/`):

- Shared shadcn/ui components (Button, Card, Input, etc.)

### 3. **Business Logic Layer**

**Game Engine** (`render/Game.ts`):

- Core drawing logic
- Shape rendering (rect, ellipse, line, arrow, diamond, triangle, pencil, text)
- Mouse event handling
- Pan/zoom functionality
- Undo/redo system
- Real-time shape synchronization

**Actions** (`actions/`):

- Server-side functions for data fetching
- Room management
- User operations

**Hooks** (`hooks/`):

- Custom React hooks for shared logic
- `useSocket.tsx` - WebSocket connection management
- `useUser.tsx` - User authentication state

### 4. **Data Flow**

```
User Interaction
      ↓
Canvas Component
      ↓
Game Engine (Event Handler)
      ↓
Drawing Logic / State Update
      ↓
      ├─→ Local Render (Canvas API)
      └─→ WebSocket (Broadcast to others)
            ↓
      WebSocket Server
            ↓
      Other Clients
            ↓
      Remote Render
```

## Technology Stack

### Frontend

- **Framework:** Next.js 15.1.5 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **Icons:** Lucide React
- **Animations:** Framer Motion (motion/react)
- **Canvas:** HTML5 Canvas API

### Backend Integration

- **HTTP Client:** Fetch API (Next.js)
- **Real-time:** WebSocket (native)
- **Authentication:** Token-based

### Development Tools

- **Package Manager:** pnpm
- **Build Tool:** Next.js bundler
- **Type Checking:** TypeScript
- **Linting:** ESLint
- **CSS Processing:** PostCSS + Tailwind

## Key Design Patterns

### 1. **Server Components & Client Components**

- Server Components for static content (Landing page, etc.)
- Client Components for interactive features (Canvas, Toolbar)
- Clear separation with `"use client"` directive

### 2. **Component Composition**

- Small, focused components
- Props-based configuration
- Reusable UI primitives

### 3. **State Management**

- React's built-in hooks (useState, useEffect)
- Props drilling for simple cases
- Context avoided for performance (canvas-heavy app)

### 4. **Real-time Synchronization**

- Optimistic updates (draw locally first)
- WebSocket for broadcasting
- State reconciliation on conflicts

### 5. **Canvas Rendering**

- Immediate mode rendering (clear & redraw)
- Transformation matrix for pan/zoom
- Layer-based stroke/fill operations

## Data Models

### Shape Types

```typescript
type Shape =
  | RectShape
  | EllipseShape
  | DiamondShape
  | TriangleShape
  | LineShape
  | ArrowShape
  | PencilShape
  | TextShape;

// Each shape has:
// - type: discriminator
// - geometry: position, size
// - style: color, width, opacity, strokeStyle
```

### Websocket Messages

```typescript
{
  type: "draw" | "erase" | "join" | "leave",
  data: string (JSON serialized),
  roomId: string,
  userId?: string
}
```

## Performance Considerations

1. **Canvas Optimization:**

   - Minimize redraws
   - Use transformation matrix instead of recalculating coordinates
   - Batch operations when possible

2. **WebSocket Efficiency:**

   - Send only deltas, not full state
   - Throttle high-frequency events (mousemove)
   - Compress message payloads

3. **React Performance:**
   - Memoization where needed
   - Avoid unnecessary re-renders
   - Lazy load heavy components

## Security

1. **Authentication:**

   - Token-based auth
   - Secure token storage
   - Token validation on backend

2. **WebSocket:**

   - Token in connection URL
   - Server-side validation
   - Rate limiting (backend)

3. **Input Validation:**
   - Sanitize user inputs
   - Validate shape data
   - Prevent XSS in text shapes

## Scalability

1. **Frontend:**

   - Static generation for landing pages
   - CDN for assets
   - Code splitting

2. **Backend:**

   - Horizontal scaling of WebSocket servers
   - Load balancing
   - Database sharding for rooms

3. **Real-time:**
   - Room-based message routing
   - Connection pooling
   - Graceful degradation
