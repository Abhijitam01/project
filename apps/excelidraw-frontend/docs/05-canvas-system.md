# Canvas System Deep Dive

## Overview

The canvas system is the heart of the drawing application. It's built on the HTML5 Canvas API and handles all drawing, user interactions, and real-time synchronization.

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Canvas Component                    │
│                                                  │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │   Toolbar    │  │      Sidebar            │   │
│  │              │  │                         │   │
│  │  • Tools     │  │  • Colors               │   │
│  │  • Undo/Redo │  │  • Stroke Width         │   │
│  │              │  │  • Opacity              │   │
│  │              │  │  • Stroke Style         │   │
│  └──────────────┘  └────────────────────────┘   │
│         │                     │                  │
│         └──────────┬──────────┘                  │
│                    ▼                             │
│           ┌────────────────┐                     │
│           │   Canvas State │                     │
│           │                │                     │
│           │  • activeTool  │                     │
│           │  • strokeFill  │                     │
│           │  • bgFill      │                     │
│           │  • strokeWidth │                     │
│           │  • opacity     │                     │
│           │  • strokeStyle │                     │
│           │  • fontSize    │                     │
│           └────────────────┘                     │
│                    │                             │
│                    ▼                             │
│         ┌─────────────────────┐                  │
│         │   <canvas> Element  │                  │
│         └─────────────────────┘                  │
│                    │                             │
└────────────────────┼─────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │    Game Instance      │
          │                       │
          │  • Canvas Context     │
          │  • Event Handlers     │
          │  • Drawing Methods    │
          │  • Shape Storage      │
          │  • History Stack      │
          │  • WebSocket          │
          └──────────────────────┘
```

## Core Concepts

### 1. Immediate Mode Rendering

The canvas uses **immediate mode** rendering, meaning:

- No scene graph or DOM representation of shapes
- Every frame, the entire canvas is cleared and redrawn
- Changes require calling drawing functions again

**Flow:**

```
User draws → mouseMove → clearCanvas() → redraw all existing shapes + preview shape
```

**Advantages:**

- Simple mental model
- Full control over rendering
- Easy to implement transformations

**Disadvantages:**

- Must store shapes in memory
- Redraw everything on each change
- Can be inefficient for many shapes

### 2. Coordinate Systems

The canvas has two coordinate systems:

#### Screen Coordinates (pixels)

- Raw mouse event coordinates
- `e.clientX`, `e.clientY`
- Affected by scroll position

#### Canvas Coordinates (drawing space)

- Transformed coordinates accounting for pan/zoom
- Used for drawing shapes
- `transformPanScale()` converts screen → canvas

```typescript
transformPanScale(clientX: number, clientY: number) {
  const x = (clientX - this.panX) / this.scale
  const y = (clientY - this.panY) / this.scale
  return { x, y }
}
```

### 3. Transformation Matrix

For pan and zoom:

```typescript
this.ctx.setTransform(
  this.scale, // horizontal scaling
  0, // horizontal skewing
  0, // vertical skewing
  this.scale, // vertical scaling
  this.panX, // horizontal translation
  this.panY, // vertical translation
);
```

## Shape Types

### Type Definition

```typescript
export type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number; ... }
  | { type: "ellipse"; centerX: number; centerY: number; radX: number; radY: number; ... }
  | { type: "line"; fromX: number; fromY: number; toX: number; toY: number; ... }
  | { type: "arrow"; fromX: number; fromY: number; toX: number; toY: number; ... }
  | { type: "diamond"; x: number; y: number; width: number; height: number; ... }
  | { type: "triangle"; x: number; y: number; width: number; height: number; ... }
  | { type: "pencil"; points: {x: number, y: number}[]; ... }
  | { type: "text"; x: number; y: number; text: string; fontSize: number; ... }
```

### Common Properties

All shapes have:

- `strokeWidth: number` - Line thickness
- `strokeFill: string` - Stroke/outline color
- `opacity: number` - Transparency (0-1)
- `strokeStyle: "solid" | "dashed" | "dotted"` - Line style

Filled shapes also have:

- `bgFill: string` - Fill color

### Shape-Specific Properties

**Rectangle, Diamond, Triangle:**

- `x, y` - Top-left corner
- `width, height` - Dimensions (can be negative for reverse drawing)

**Ellipse:**

- `centerX, centerY` - Center point
- `radX, radY` - Radii

**Line, Arrow:**

- `fromX, fromY` - Start point
- `toX, toY` - End point

**Pencil:**

- `points: {x, y}[]` - Array of points forming the path

**Text:**

- `text: string` - Text content
- `fontSize: number` - Font size in pixels

## Drawing Methods

### Basic Shapes

Each drawing method follows this pattern:

```typescript
drawRect(x, y, width, height, strokeWidth, strokeFill, bgFill, opacity, strokeStyle) {
  // 1. Normalize dimensions (handle negative width/height)
  const posX = width < 0 ? x + width : x;
  const posY = height < 0 ? y + height : y;
  const normalizedWidth = Math.abs(width);
  const normalizedHeight = Math.abs(height);

  // 2. Apply opacity
  const previousAlpha = this.ctx.globalAlpha;
  this.ctx.globalAlpha = opacity;

  // 3. Apply stroke style (dashed/dotted)
  this.applyStrokeStyle(strokeStyle);

  // 4. Draw the shape
  this.ctx.beginPath();
  // ... path construction
  this.ctx.strokeStyle = strokeFill;
  this.ctx.fillStyle = bgFill;
  this.ctx.lineWidth = strokeWidth;
  this.ctx.fill();
  this.ctx.stroke();

  // 5. Restore context state
  this.ctx.globalAlpha = previousAlpha;
  this.ctx.setLineDash([]);
}
```

### Stroke Styles

```typescript
applyStrokeStyle(strokeStyle: StrokeStyle) {
  if (strokeStyle === "dashed") {
    this.ctx.setLineDash([10, 5]); // 10px dash, 5px gap
  } else if (strokeStyle === "dotted") {
    this.ctx.setLineDash([2, 3]); // 2px dot, 3px gap
  } else {
    this.ctx.setLineDash([]); // solid line
  }
}
```

### Special Cases

**Arrow:**

- Draws a line
- Calculates arrowhead angle using trigonometry
- Draws two lines for the arrowhead

```typescript
const angle = Math.atan2(toY - fromY, toX - fromX);
const arrowLength = 15;
const arrowAngle = Math.PI / 6; // 30 degrees

// Arrowhead lines
this.ctx.lineTo(
  toX - arrowLength * Math.cos(angle - arrowAngle),
  toY - arrowLength * Math.sin(angle - arrowAngle),
);
```

**Rounded Rectangle:**

- Uses quadratic curves for corners
- Corner radius calculated based on size

```typescript
const radius = Math.min(
  Math.abs(Math.max(width, height) / 20),
  width / 2,
  height / 2,
);
this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
```

## Mouse Event Handling

### Event Flow

```
Mouse Down → Mouse Move (many times) → Mouse Up
     ↓              ↓                       ↓
  Start draw   Live preview              Finalize
     ↓              ↓                       ↓
 Save start    Clear + redraw all      Add to shapes
  position      + draw current shape    Send via WS
```

### Mouse Down Handler

```typescript
mouseDownHandler(e: MouseEvent) {
  this.clicked = true;
  const { x, y } = this.transformPanScale(e.clientX, e.clientY);
  this.startX = x;
  this.startY = y;

  // Special cases:
  if (this.activeTool === "pencil") {
    // Start new pencil path
    this.existingShape.push({
      type: "pencil",
      points: [{x, y}],
      // ...
    });
  }
}
```

### Mouse Move Handler

```typescript
mouseMoveHandler(e: MouseEvent) {
  if (!this.clicked) return;

  const { x, y } = this.transformPanScale(e.clientX, e.clientY);
  const width = x - this.startX;
  const height = y - this.startY;

  this.clearCanvas(); // Clear and redraw all existing shapes

  // Draw preview of current shape
  if (this.activeTool === "rect") {
    this.drawRect(this.startX, this.startY, width, height, ...);
  }
  // ... other tools
}
```

### Mouse Up Handler

```typescript
mouseUpHandler(e: MouseEvent) {
  this.clicked = false;

  const { x, y } = this.transformPanScale(e.clientX, e.clientY);
  const width = x - this.startX;
  const height = y - this.startY;

  // Create shape object
  let shape: Shape | null = null;
  if (this.activeTool === "rect") {
    shape = {
      type: "rect",
      x: this.startX,
      y: this.startY,
      width,
      height,
      strokeWidth: this.strokeWidth,
      strokeFill: this.strokeFill,
      bgFill: this.bgFill,
      opacity: this.opacity,
      strokeStyle: this.strokeStyle,
    };
  }

  if (!shape) return;

  // Add to local state
  this.existingShape.push(shape);

  // Send to other users
  this.socket.send(JSON.stringify({
    type: "draw",
    data: JSON.stringify({ shape }),
    roomId: this.roomId
  }));
}
```

## Pan and Zoom

### Zoom (Mouse Wheel)

```typescript
mouseWheelHandler(e: WheelEvent) {
  e.preventDefault();

  // Calculate new scale
  const scaleAmount = -e.deltaY / 200;
  const newScale = this.scale * (1 + scaleAmount);

  // Get mouse position on canvas
  const mouseX = e.clientX - this.canvas.offsetLeft;
  const mouseY = e.clientY - this.canvas.offsetTop;

  // Calculate position in canvas space
  const canvasMouseX = (mouseX - this.panX) / this.scale;
  const canvasMouseY = (mouseY - this.panY) / this.scale;

  // Adjust pan to zoom toward cursor
  this.panX -= (canvasMouseX * (newScale - this.scale));
  this.panY -= (canvasMouseY * (newScale - this.scale));

  this.scale = newScale;
  this.clearCanvas();
}
```

### Pan (Grab Tool)

```typescript
// On mouse move with grab tool:
const { x: transformedX, y: transformedY } = this.transformPanScale(
  e.clientX,
  e.clientY,
);
const { x: startTransformedX, y: startTransformedY } = this.transformPanScale(
  this.startX,
  this.startY,
);

const deltaX = transformedX - startTransformedX;
const deltaY = transformedY - startTransformedY;

this.panX += deltaX * this.scale;
this.panY += deltaY * this.scale;
```

## Undo/Redo System

### History Stack

```typescript
private history: Shape[][] = []
private historyStep: number = -1
```

### Saving to History

```typescript
saveToHistory() {
  // Remove any future history if we're not at the end
  this.history = this.history.slice(0, this.historyStep + 1);

  // Add current state
  this.history.push([...this.existingShape]);
  this.historyStep++;
}
```

### Undo

```typescript
undo() {
  if (this.historyStep > 0) {
    this.historyStep--;
    this.existingShape = [...this.history[this.historyStep]];
    this.clearCanvas();
  }
}
```

### Redo

```typescript
redo() {
  if (this.historyStep < this.history.length - 1) {
    this.historyStep++;
    this.existingShape = [...this.history[this.historyStep]];
    this.clearCanvas();
  }
}
```

## Real-time Synchronization

### Outgoing Events (Local to Remote)

```typescript
// After creating a shape
this.socket.send(
  JSON.stringify({
    type: "draw",
    data: JSON.stringify({ shape }),
    roomId: this.roomId,
  }),
);
```

### Incoming Events (Remote to Local)

```typescript
// In WebSocket message handler
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "draw") {
    const { shape } = JSON.parse(message.data);
    this.existingShape.push(shape);
    this.clearCanvas();
  } else if (message.type === "erase") {
    // Handle deletion
  }
});
```

### Handling Conflicts

Currently uses "last write wins" strategy:

- No conflict resolution
- All clients trust the server
- Shapes are appended in order received

**Future improvements:**

- Operational transformation
- CRDT-based synchronization
- Version vectors

## Performance Optimizations

### Current Optimizations

1. **Transformation Matrix:** Use canvas transformations instead of recalculating all coordinates
2. **Context State Restoration:** Save and restore `globalAlpha` and line dash instead of resetting entire context
3. **Selective Redraw:** Only redraw when needed (mouse move while clicked)

### Potential Improvements

1. **Dirty Rectangles:** Only redraw regions that changed
2. **Offscreen Canvas:** Pre-render static shapes to offscreen canvas
3. **WebGL:** Use WebGL for hardware-accelerated rendering
4. **Shape Culling:** Don't render shapes outside viewport
5. **Level of Detail:** Simpler rendering when zoomed out
6. **Throttle Events:** Limit mousemove event frequency

## Advanced Features (Future)

### Selection

```typescript
// Detect clicked shape
const clickedShapeIndex = this.existingShape.findIndex((shape) =>
  this.isPointInShape(x, y, shape),
);

// Draw selection outline
if (selectedShape) {
  this.ctx.strokeStyle = "blue";
  this.ctx.lineWidth = 2;
  this.ctx.setLineDash([5, 5]);
  // Draw bounding box
}
```

### Resize Handles

```typescript
// Calculate handle positions
const handles = [
  { x: shape.x, y: shape.y }, // top-left
  { x: shape.x + shape.width, y: shape.y }, // top-right
  { x: shape.x, y: shape.y + shape.height }, // bottom-left
  { x: shape.x + shape.width, y: shape.y + shape.height }, // bottom-right
];

// Detect handle clicks
const clickedHandle = handles.findIndex(
  (handle) => Math.hypot(handle.x - mouseX, handle.y - mouseY) < 10,
);
```

### Rotation

```typescript
// Apply rotation transform
this.ctx.save();
this.ctx.translate(centerX, centerY);
this.ctx.rotate(shape.rotation);
this.ctx.translate(-centerX, -centerY);
// Draw shape
this.ctx.restore();
```

## AST & Type Safety

The canvas system is fully typed:

```typescript
// Discriminated union for type safety
type Shape =
  | RectShape
  | EllipseShape
  | ...

// TypeScript ensures all shape types are handled
function drawShape(shape: Shape) {
  switch (shape.type) {
    case "rect":
      return this.drawRect(...);
    case "ellipse":
      return this.drawEllipse(...);
    // ... compiler ensures exhaustiveness
  }
}
```

Benefits:

- Autocomplete for shape properties
- Compile-time error checking
- Refactoring safety
- Self-documenting code
