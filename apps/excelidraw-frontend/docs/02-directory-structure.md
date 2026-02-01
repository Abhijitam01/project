# Directory Structure

This document provides a detailed explanation of every folder and file in the project.

## Root Directory

```
excelidraw-frontend/
├── .next/                      # Next.js build output (generated)
├── .gitignore                  # Git ignore file
├── README.md                   # Project readme
├── package.json                # NPM dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.ts           # PostCSS configuration
├── eslint.config.js            # ESLint configuration
├── components.json             # shadcn/ui component configuration
├── env.example                 # Example environment variables
├── .env.local                  # Environment variables (not in git)
├── node_modules/               # Installed dependencies
├── public/                     # Static assets
├── app/                        # Next.js app router pages
├── components/                 # React components
├── canvas/                     # Canvas-related components
├── render/                     # Game engine and rendering logic
├── actions/                    # Server actions
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions
└── docs/                       # Documentation (this folder)
```

---

## `/app` - Application Pages (Next.js App Router)

The `app` directory contains all pages and routes using Next.js App Router.

### Files

#### `layout.tsx`

**Purpose:** Root layout component  
**What it does:**

- Wraps all pages with common HTML structure
- Imports global CSS
- Sets up metadata (title, description)
- Provides the `<html>` and `<body>` tags

**Why it's there:**  
Required by Next.js App Router to define the application shell.

#### `page.tsx`

**Purpose:** Homepage/landing page  
**What it does:**

- Renders the marketing landing page
- Displays Hero, Features, Stats, Testimonials, Pricing, FAQ, CTA, Footer
- First page users see when visiting the site

**Why it's there:**  
Entry point for the application, responsible for converting visitors to users.

#### `global.css`

**Purpose:** Global stylesheet  
**What it does:**

- Imports Tailwind CSS directives (@tailwind base, components, utilities)
- Defines CSS custom properties for theming (colors, spacing)
- Sets up light/dark mode variables
- Applies base styles to all elements

**Why it's there:**  
Provides consistent styling foundation across the entire application.

#### `favicon.ico`

**Purpose:** Browser tab icon  
**What it does:**  
Displays in browser tabs, bookmarks, and browser UI.

**Why it's there:**  
Branding and visual identity.

### Subdirectories

#### `/app/signin/`

**Files:** `page.tsx`  
**Purpose:** Sign-in page  
**What it does:** Renders login form for existing users  
**Communication:** Calls backend HTTP API for authentication

#### `/app/signup/`

**Files:** `page.tsx`  
**Purpose:** Sign-up page  
**What it does:** Renders registration form for new users  
**Communication:** Calls backend HTTP API to create accounts

#### `/app/dashboard/`

**Files:** `page.tsx`  
**Purpose:** User dashboard  
**What it does:** Shows user's rooms and workspace  
**Communication:** Fetches user data via server actions

#### `/app/create-room/`

**Files:** `page.tsx`  
**Purpose:** Room creation page  
**What it does:** Allows users to create new collaborative rooms  
**Communication:** Sends room creation request to backend

#### `/app/room/[roomName]/`

**Files:** `page.tsx`  
**Purpose:** Dynamic route for individual rooms  
**What it does:**

- Renders the collaborative canvas workspace
- Sets up WebSocket connection
- Enables real-time drawing

**Communication:**

- HTTP: Fetches room metadata
- WebSocket: Real-time drawing events

**Why `[roomName]`?**  
Dynamic routing - bracket syntax allows any room name in the URL.

---

## `/components` - React Components

### Landing Page Components

#### `Hero.tsx`

**Purpose:** Hero section of landing page  
**What it does:**

- Displays main headline and value proposition
- Shows primary CTA buttons
- Includes hero imagery/graphics

**Props:** None (static content)  
**Dependencies:** Button component, Icons

#### `Features.tsx`

**Purpose:** Features showcase section  
**What it does:**

- Lists key features of the application
- Uses cards and icons to highlight capabilities
- Responsive grid layout

**Props:** None  
**Data:** Static feature list

#### `Stats.tsx`

**Purpose:** Statistics/metrics section  
**What it does:**

- Displays platform statistics (users, drawings, etc.)
- Uses counter animations
- Social proof element

**Props:** None  
**Updates:** Could be connected to real-time data

#### `Testimonials.tsx`

**Purpose:** User testimonials section  
**What it does:**

- Showcases user reviews and feedback
- Builds trust and credibility
- Carousel or grid of testimonials

**Props:** None  
**Data:** Static testimonial list

#### `Pricing.tsx`

**Purpose:** Pricing tiers section  
**What it does:**

- Displays pricing plans (Free, Pro, Team, etc.)
- Comparison of features
- CTA buttons for each tier

**Props:** None  
**Data:** Static pricing information

#### `FAQ.tsx`

**Purpose:** Frequently Asked Questions section  
**What it does:**

- Accordion-style Q&A
- Addresses common user concerns
- Improves conversion by answering objections

**Props:** None  
**Dependencies:** Accordion component

#### `CTA.tsx`

**Purpose:** Final call-to-action section  
**What it does:**

- Encourages user action before page end
- Sign-up prompt or product trial
- Last conversion opportunity

**Props:** None  
**Dependencies:** Button component

#### `Footer.tsx`

**Purpose:** Site footer  
**What it does:**

- Copyright information
- Links to legal pages, social media
- Sitemap navigation
- Branding elements

**Props:** None  
**Always visible:** On all pages (in layout)

#### `Navbar.tsx`

**Purpose:** Navigation bar  
**What it does:**

- Site navigation menu
- Logo and branding
- Login/signup links
- Mobile hamburger menu

**Props:** None  
**State:** May track mobile menu open/closed  
**Always visible:** On all pages

### Canvas Components

#### `Toolbar.tsx`

**Purpose:** Drawing tool selector  
**What it does:**

- Displays buttons for each drawing tool (rect, ellipse, arrow, etc.)
- Shows keyboard shortcuts
- Handles tool selection state
- Includes undo/redo buttons

**Props:**

- `activeTool`: Current selected tool
- `onToolChange`: Callback when tool changes
- `game`: Reference to Game instance for undo/redo

**Communication:**  
Parent (Canvas) → Toolbar (passes state)  
Toolbar → Parent (calls callbacks)

#### `Sidebar.tsx`

**Purpose:** Style and property controls  
**What it does:**

- Stroke color picker
- Background color picker
- Stroke width selector
- Opacity slider
- Stroke style selector (solid/dashed/dotted)
- Font size control (for text tool)

**Props:**

- Current style values (strokeFill, bgFill, strokeWidth, opacity, etc.)
- Change handlers for each property
- `activeTool` to conditionally show/hide controls

**State:** None (controlled by parent)  
**Communication:** Bidirectional with Canvas component

#### `ToolButton.tsx`

**Purpose:** Individual tool button component  
**What it does:**

- Reusable button for each tool in Toolbar
- Shows icon and keyboard shortcut
- Highlights when active

**Props:**

- `icon`: Lucide React icon component
- `isActive`: Whether this tool is selected
- `onClick`: Handler for click events
- `shortcut`: Keyboard shortcut display

**Why it's there:**  
DRY principle - avoids duplicating button code for each tool.

#### `Scale.tsx`

**Purpose:** Zoom level indicator  
**What it does:**

- Displays current canvas zoom percentage
- May include zoom controls (future)

**Props:**

- `scale`: Current zoom level (0.5 = 50%, 1 = 100%, 2 = 200%)

**Communication:** Receives scale from Canvas component

### Authentication Components (`/components/auth/`)

#### `LoginForm.tsx`

**Purpose:** Login form component  
**What it does:**

- Email/password inputs
- Form validation
- Submit handler
- Error display

**Dependencies:** Form, Input, Button components  
**Communication:** Calls authentication API

#### `Register-form.tsx`

**Purpose:** Registration form component  
**What it does:**

- User registration inputs
- Password confirmation
- Terms acceptance
- Form validation

**Dependencies:** Form, Input, Button components  
**Communication:** Calls user creation API

#### `CreateRoomForm.tsx`

**Purpose:** Room creation form  
**What it does:**

- Room name input
- Privacy settings
- Create room action

**Dependencies:** Form, Input, Button components  
**Communication:** Calls room creation API

### UI Components (`/components/ui/`)

These are shadcn/ui components - reusable, accessible primitives:

- **`button.tsx`** - Button component with variants
- **`card.tsx`** - Card container component
- **`input.tsx`** - Text input field
- **`form.tsx`** - Form context and validation
- **`label.tsx`** - Form label
- **`separator.tsx`** - Visual divider
- **`avatar.tsx`** - User avatar component
- **`accordion.tsx`** - Collapsible content container

All are:

- Fully typed with TypeScript
- Accessible (ARIA attributes)
- Customizable with Tailwind classes
- Built on Radix UI primitives

---

## `/canvas` - Canvas-Specific Components

#### `Canvas.tsx`

**Purpose:** Main canvas component wrapper  
**What it does:**

- Creates canvas element reference
- Initializes Game engine
- Manages canvas state (tool, colors, sizes)
- Renders Toolbar and Sidebar
- Passes props to child components

**State:**

- `tool` - Current drawing tool
- `strokeFill`, `bgFill` - Colors
- `strokeWidth` - Line thickness
- `opacity` - Transparency
- `strokeStyle` - Line style
- `fontSize` - Text size

**Props:** None (root component)  
**Children:** Toolbar, Sidebar  
**Communication:**

- Creates Game instance
- Passes state down to children
- Receives callbacks from children

#### `RoomCanvas.tsx`

**Purpose:** Room-specific canvas with WebSocket  
**What it does:**

- Sets up WebSocket connection for real-time sync
- Passes room ID and socket to Canvas
- Handles connection lifecycle
- Manages token authentication

**Props:**

- `roomId` - Room identifier
- `token` - Authentication token

**Communication:**

- WebSocket server for real-time events
- Passes socket to Game engine

---

## `/render` - Game Engine

#### `Game.ts`

**Purpose:** Core drawing engine  
**What it does:**

- **Canvas Management:** Initializes 2D context, manages canvas size
- **Mouse Events:** Handles mousedown, mousemove, mouseup, wheel
- **Drawing Methods:** drawRect, drawEllipse, drawLine, drawArrow, drawDiamond, drawTriangle, drawPencil, drawText
- **Shape Storage:** Manages array of shapes (`existingShape`)
- **Pan/Zoom:** Transformation matrix for viewport
- **Undo/Redo:** History stack for actions
- **Style Management:** Opacity, stroke styles (solid/dashed/dotted)
- **WebSocket Sync:** Sends/receives drawing events

**Key Methods:**

- `mouseDownHandler()` - Start drawing/selection
- `mouseMoveHandler()` - Live preview during drawing
- `mouseUpHandler()` - Finalize shape
- `mouseWheelHandler()` - Zoom in/out
- `clearCanvas()` - Redraw all shapes
- `undo()` / `redo()` - History management
- `applyStrokeStyle()` - Apply line styles
- `isPointInShape()` - Collision detection

**State:**

- `existingShape: Shape[]` - All shapes in the room
- `activeTool` - Current drawing tool
- `clicked: boolean` - Mouse down state
- `startX, startY` - Drawing start coordinates
- `scale, panX, panY` - Viewport transformation
- `history, historyStep` - Undo/redo stack

**Communication:**

- Sends events via WebSocket
- Receives events via WebSocket message handler
- Called by Canvas component for rendering

---

## `/actions` - Server Actions

#### `room.actions.ts`

**Purpose:** Room-related server actions  
**What it does:**

- Fetch room data
- Create rooms
- Join rooms
- Delete rooms

**Why server actions?**  
Next.js server actions run on the server, enabling secure database access.

#### `user.actions.ts`

**Purpose:** User-related server actions  
**What it does:**

- Get user profile
- Update user settings
- Fetch user's rooms

---

## `/hooks` - Custom React Hooks

#### `useSocket.tsx`

**Purpose:** WebSocket connection management  
**What it does:**

- Creates WebSocket connection
- Handles connection lifecycle (open, close, error)
- Provides message handler registration
- Auto-reconnection logic

**Returns:** WebSocket instance  
**Usage:** In RoomCanvas

#### `useUser.tsx`

**Purpose:** User authentication state  
**What it does:**

- Fetches current user
- Manages auth state
- Provides user context

**Returns:** User object or null

---

## `/lib` - Utility Functions

#### `utils.ts`

**Purpose:** Shared utility functions  
**What it does:**

- `cn()` - Conditional class name merger for Tailwind

---

## `/public` - Static Assets

Contains images, icons, fonts, and other static files served directly by the web server.

---

## Configuration Files

### `package.json`

**Purpose:** Project metadata and dependencies  
**Key scripts:**

- `dev` - Start development server
- `build` - Create production build
- `start` - Start production server
- `lint` - Run ESLint

### `tsconfig.json`

**Purpose:** TypeScript compiler configuration  
**Key settings:**

- Strict type checking
- Module resolution
- Path aliases (`@/*`)

### `next.config.ts`

**Purpose:** Next.js framework configuration  
**Settings:**

- Image optimization
- Experimental features
- Environment variables

### `tailwind.config.ts`

**Purpose:** Tailwind CSS configuration  
**Defines:**

- Theme colors
- Custom utilities
- Plugin configuration
- Dark mode settings

### `postcss.config.ts`

**Purpose:** PostCSS configuration (CSS processing)  
**Plugins:**

- Tailwind CSS
- Autoprefixer

### `.env.local`

**Purpose:** Environment variables  
**Contains:**

- `NEXT_PUBLIC_WS_URL` - WebSocket server URL
- `NEXT_PUBLIC_HTTP_URL` - HTTP backend URL

**Why `.local`?**  
Not committed to git - each developer/environment has their own.
