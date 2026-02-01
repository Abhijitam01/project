# Real-Time Communication System

This document explains how real-time collaboration works in Excelidraw.

## Architecture Overview

```
┌─────────────┐         WebSocket          ┌──────────────┐
│  Client A   │ ◄─────────────────────────► │              │
│  (Browser)  │                              │              │
└─────────────┘                              │  WebSocket   │
                                             │   Server     │
┌─────────────┐         WebSocket          │  (Port 8080) │
│  Client B   │ ◄─────────────────────────► │              │
│  (Browser)  │                              │              │
└─────────────┘                              └──────────────┘
```

## WebSocket Lifecycle

### 1. Connection Establishment

**Client Side** (`hooks/useSocket.tsx`):

```typescript
const useSocket = (token: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`,
    );

    ws.addEventListener("open", () => {
      console.log("WebSocket connected");
      setSocket(ws);
    });

    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.addEventListener("close", () => {
      console.log("WebSocket disconnected");
      setSocket(null);
    });

    return () => ws.close();
  }, [token]);

  return socket;
};
```

**Authentication Flow:**

1. User logs in → receives JWT token
2. Token sent in WebSocket URL query parameter
3. Server validates token on connection
4. Connection accepted or rejected

### 2. Joining a Room

**Client** (`canvas/RoomCanvas.tsx`):

```typescript
const socket = new WebSocket(
  `${process.env.NEXT_PUBLIC_WS_URL}/?token=${token}`,
);

socket.addEventListener("open", () => {
  // Send join message
  socket.send(
    JSON.stringify({
      type: "join",
      roomId: roomId,
      userId: user.id,
    }),
  );
});
```

**Server:**

- Receives join message
- Adds connection to room's connection pool
- Broadcasts to room: "User X joined"
- Sends current room state to new user

### 3. Drawing Event Flow

```
User A draws rectangle
       ↓
Game.mouseUpHandler()
       ↓
Create shape object
       ↓
Add to local existingShape[]
       ↓
Render locally (immediate)
       ↓
socket.send({ type: "draw", data: shape })
       ↓
WebSocket Server
       ↓
Broadcast to all clients in room (except sender)
       ↓
User B receives message
       ↓
Game message handler
       ↓
Parse shape data
       ↓
Add to existingShape[]
       ↓
clearCanvas() → redraw all
```

### 4. Message Types

All messages follow this structure:

```typescript
interface WebSocketMessage {
  type: "draw" | "erase" | "join" | "leave" | "cursor" | "sync";
  data: string; // JSON stringified
  roomId: string;
  userId?: string;
  timestamp?: number;
}
```

#### Draw Message

```typescript
{
  type: "draw",
  data: JSON.stringify({
    shape: {
      type: "rect",
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      strokeWidth: 2,
      strokeFill: "#fff",
      bgFill: "#000",
      opacity: 1,
      strokeStyle: "solid"
    }
  }),
  roomId: "abc123"
}
```

#### Erase Message

```typescript
{
  type: "erase",
  data: JSON.stringify({
    shape: { /* shape to remove */ }
  }),
  roomId: "abc123"
}
```

#### Join/Leave Messages

```typescript
{
  type: "join",
  roomId: "abc123",
  userId: "user456",
  data: JSON.stringify({
    userName: "John Doe",
    avatar: "..."
  })
}
```

## Implementation Details

### Game.ts WebSocket Integration

**Initialization:**

```typescript
constructor(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket,
  room: any,
  onScaleChangeCallback: (scale: number) => void
) {
  this.socket = socket;
  this.roomId = roomId;
  this.existingShape = room.shapes || [];

  // Set up message handler
  this.initHandler();
}
```

**Message Handler:**

```typescript
initHandler() {
  this.socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "draw") {
      const { shape } = JSON.parse(message.data);
      this.existingShape.push(shape);
      this.clearCanvas();
    }
    else if (message.type === "erase") {
      const { shape } = JSON.parse(message.data);
      const index = this.existingShape.findIndex(s =>
        this.shapeEquals(s, shape)
      );
      if (index !== -1) {
        this.existingShape.splice(index, 1);
        this.clearCanvas();
      }
    }
  });
}
```

**Sending Messages:**

```typescript
// After creating a shape
this.socket.send(
  JSON.stringify({
    type: "draw",
    data: JSON.stringify({ shape }),
    roomId: this.roomId,
  }),
);

// After erasing a shape
this.socket.send(
  JSON.stringify({
    type: "erase",
    data: JSON.stringify({ shape: erasedShape }),
    roomId: this.roomId,
  }),
);
```

## Optimistic Updates

The application uses **optimistic updates** for better UX:

1. **User draws** → Immediately render locally (no network delay)
2. **Send to server** → Broadcast to others
3. **Others receive** → Update their canvas

**Benefits:**

- No lag for the drawing user
- Smooth local experience

**Trade-offs:**

- Potential inconsistencies if server rejects
- Requires conflict resolution (not yet implemented)

## Conflict Resolution

**Current Strategy:** Last Write Wins

- No conflict detection
- Shapes appended in order received
- Works for most cases with few users

**Limitations:**

- Concurrent edits to same shape can conflict
- No undo synchronization across clients
- Race conditions possible

**Future Improvements:**

### Operational Transformation (OT)

Transform operations to maintain Intent:

```typescript
// User A: Move shape right by 10px
// User B: Move same shape up by 5px

// After OT transformation:
// Final state: Shape moved right 10px AND up 5px
```

### CRDTs (Conflict-free Replicated Data Types)

Use data structures that automatically merge:

```typescript
import { Y } from "yjs";

const ydoc = new Y.Doc();
const shapes = ydoc.getArray("shapes");

// Changes automatically sync without conflicts
shapes.push([newShape]);
```

### Vector Clocks

Track causality of operations:

```typescript
{
  shapeId: "abc",
  operation: "move",
  vectorClock: {
    user1: 5,
    user2: 3,
    user3: 7
  }
}
```

## Performance Considerations

### 1. Message Throttling

High-frequency events (like mousemove for cursor tracking) should be throttled:

```typescript
let lastCursorUpdate = 0;
const THROTTLE_MS = 50; // Max 20 updates/second

function sendCursorPosition(x: number, y: number) {
  const now = Date.now();
  if (now - lastCursorUpdate < THROTTLE_MS) return;

  lastCursorUpdate = now;
  socket.send(
    JSON.stringify({
      type: "cursor",
      data: { x, y },
      roomId: this.roomId,
    }),
  );
}
```

### 2. Message Batching

Batch multiple operations into single message:

```typescript
const pendingOps: Operation[] = [];

function batchOperation(op: Operation) {
  pendingOps.push(op);

  if (pendingOps.length === 1) {
    // Schedule flush
    setTimeout(flushOperations, 16); // ~60fps
  }
}

function flushOperations() {
  if (pendingOps.length === 0) return;

  socket.send(
    JSON.stringify({
      type: "batch",
      data: JSON.stringify({ operations: pendingOps }),
      roomId: this.roomId,
    }),
  );

  pendingOps.length = 0;
}
```

### 3. Binary Protocol

JSON is verbose. Consider binary formats for better performance:

```typescript
// Using MessagePack
import { encode, decode } from '@msgpack/msgpack';

// Send
const data = encode({ type: "draw", shape: ... });
socket.send(data);

// Receive
socket.addEventListener('message', (event) => {
  const message = decode(event.data);
});
```

**Benefits:**

- 30-50% smaller messages
- Faster parsing
- Better for high-frequency updates

## Error Handling

### Connection Loss

```typescript
socket.addEventListener("close", () => {
  // Show reconnecting UI
  showNotification("Connection lost. Reconnecting...");

  // Attempt reconnection
  setTimeout(() => {
    reconnect();
  }, 1000);
});

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function reconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    showError("Unable to reconnect. Please refresh.");
    return;
  }

  reconnectAttempts++;

  const newSocket = new WebSocket(wsUrl);
  newSocket.addEventListener("open", () => {
    reconnectAttempts = 0;
    showNotification("Reconnected!");
  });
}
```

### Message Failures

```typescript
// Add message queue for reliability
const messageQueue: Message[] = [];

function sendReliable(message: Message) {
  messageQueue.push(message);

  try {
    socket.send(JSON.stringify(message));
    // Remove from queue on success
    messageQueue.shift();
  } catch (error) {
    console.error("Send failed, will retry when connected");
  }
}

socket.addEventListener("open", () => {
  // Flush queue on reconnection
  messageQueue.forEach((msg) => {
    socket.send(JSON.stringify(msg));
  });
  messageQueue.length = 0;
});
```

## Security

### 1. Authentication

```typescript
// Server validates token on connection
wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "ws://localhost");
  const token = url.searchParams.get("token");

  try {
    const user = jwt.verify(token, SECRET);
    ws.user = user;
  } catch (error) {
    ws.close(1008, "Invalid token");
    return;
  }
});
```

### 2. Authorization

```typescript
// Check user has access to room
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  if (!canAccessRoom(ws.user.id, message.roomId)) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Access denied",
      }),
    );
    return;
  }

  // Process message...
});
```

### 3. Rate Limiting

```typescript
const rateLimits = new Map<string, RateLimit>();

function checkRateLimit(userId: string): boolean {
  const limit = rateLimits.get(userId) || {
    count: 0,
    resetTime: Date.now() + 60000,
  };

  if (Date.now() > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = Date.now() + 60000;
  }

  limit.count++;
  rateLimits.set(userId, limit);

  return limit.count <= 100; // Max 100 messages per minute
}
```

### 4. Input Validation

```typescript
function validateShape(shape: any): shape is Shape {
  if (!shape.type) return false;
  if (typeof shape.strokeWidth !== "number") return false;
  if (shape.strokeWidth < 0 || shape.strokeWidth > 100) return false;
  // ... more checks
  return true;
}

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const { shape } = JSON.parse(message.data);

  if (!validateShape(shape)) {
    console.warn("Invalid shape received, ignoring");
    return;
  }

  // Process valid shape...
});
```

## Testing

### Unit Tests

```typescript
describe('WebSocket Handler', () => {
  let mockSocket: MockWebSocket;
  let game: Game;

  beforeEach(() => {
    mockSocket = new MockWebSocket();
    game = new Game(canvas, 'room1', mockSocket, {}, () => {});
  });

  it('adds shape on draw message', () => {
    const shape = { type: 'rect', ... };

    mockSocket.send({
      type: 'draw',
      data: JSON.stringify({ shape }),
      roomId: 'room1'
    });

    expect(game.existingShape).toContain(shape);
  });
});
```

### Integration Tests

```typescript
describe('Real-time Drawing', () => {
  it('synchronizes between two clients', async () => {
    const client1 = new TestClient('room1');
    const client2 = new TestClient('room1');

    await client1.draw({ type: 'rect', ... });

    await wait(100); // Network delay

    expect(client2.getShapes()).toHaveLength(1);
  });
});
```

## Monitoring

### Metrics to Track

1. **Connection Count:** Active WebSocket connections
2. **Message Rate:** Messages per second
3. **Latency:** Time from send to receive
4. **Error Rate:** Failed deliveries
5. **Reconnection Rate:** How often clients reconnect

### Logging

```typescript
// Client-side
const logger = {
  connection: (event: string) => {
    analytics.track("websocket_connection", {
      event,
      timestamp: Date.now(),
    });
  },

  message: (type: string, size: number) => {
    analytics.track("websocket_message", {
      type,
      size,
      timestamp: Date.now(),
    });
  },
};

socket.addEventListener("open", () => logger.connection("open"));
socket.addEventListener("close", () => logger.connection("close"));
```

## Future Enhancements

1. **Cursor Tracking:** Show other users' cursors in real-time
2. **Presence Awareness:** User list with online status
3. **Voice/Video:** WebRTC for audio/video chat
4. **Locking:** Prevent concurrent edits to same shape
5. **Permissions:** Read-only vs edit access
6. **History Sync:** Sync undo/redo across clients
7. **Offline Mode:** Cache operations, sync when online
8. **Delta Sync:** Send only changes, not full shapes
