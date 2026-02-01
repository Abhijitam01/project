# Enhancement Roadmap

This document outlines potential improvements and features that can enhance the Excelidraw application.

## Priority Matrix

### High Priority (Core Features Missing)

#### 1. Selection & Manipulation Tool ⭐⭐⭐

**Current State:** Structure exists but not fully implemented  
**What's needed:**

- Click to select shapes
- Drag to move selected shapes
- Resize handles on corners
- Multi-select with Shift+click or drag box
- Delete selected shapes with Delete/Backspace key

**Implementation:**

```typescript
// In Game.ts
private selectedShapes: number[] = []; // indices of selected shapes

isPointInShape(x: number, y: number, shape: Shape): boolean {
  // Already implemented for rectangles, ellipses, lines, pencil
  // Need to add for diamond, triangle, arrow
}

selectShape(x: number, y: number) {
  const index = this.existingShape.findIndex(shape =>
    this.isPointInShape(x, y, shape)
  );
  if (index !== -1) {
    this.selectedShapes = [index];
  }
}
```

**Benefits:** Essential for editing existing drawings

---

#### 2. Text Tool Completion ⭐⭐⭐

**Current State:** Drawing method exists, input mechanism missing  
**What's needed:**

- Click to place text cursor
- Show input modal/contenteditable div
- Type text and confirm
- Edit existing text by double-clicking

**Implementation:**

```typescript
// Show input at click location
showTextInput(x: number, y: number) {
  const input = document.createElement('div');
  input.contentEditable = true;
  input.style.position = 'absolute';
  input.style.left = `${x}px`;
  input.style.top = `${y}px`;
  input.style.fontSize = `${this.fontSize}px`;
  // ... styling

  input.addEventListener('blur', () => {
    const text = input.textContent;
    if (text) {
      this.createTextShape(x, y, text);
    }
    input.remove();
  });

  document.body.appendChild(input);
  input.focus();
}
```

**Benefits:** Required for annotations and labels

---

#### 3. Export Functionality ⭐⭐⭐

**Current State:** Not implemented  
**What's needed:**

- Export to PNG (high-res)
- Export to SVG (vector)
- Export to JSON (for saving/loading)
- Copy to clipboard

**Implementation:**

```typescript
exportToPNG() {
  // Create offscreen canvas at higher resolution
  const scale = 2; // 2x for retina
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = this.canvas.width * scale;
  offscreenCanvas.height = this.canvas.height * scale;

  const ctx = offscreenCanvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // Render all shapes
  this.existingShape.forEach(shape => {
    // ... draw each shape
  });

  // Download
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = offscreenCanvas.toDataURL();
  link.click();
}

exportToSVG() {
  // Convert each shape to SVG elements
  const svgElements = this.existingShape.map(shape => {
    if (shape.type === 'rect') {
      return `<rect x="${shape.x}" y="${shape.y}" .../>`;
    }
    // ... other shapes
  });

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${this.canvas.width}"
         height="${this.canvas.height}">
      ${svgElements.join('\n')}
    </svg>
  `;

  // Download
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  // ... download logic
}
```

**Benefits:** Users can save and share their work

---

### Medium Priority (UX Improvements)

#### 4. Grid & Snap-to-Grid ⭐⭐

**What's needed:**

- Toggle grid background
- Configurable grid size
- Snap shapes to grid points
- Visual grid lines

**Implementation:**

```typescript
private showGrid: boolean = false;
private gridSize: number = 20;

drawGrid() {
  if (!this.showGrid) return;

  this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  this.ctx.lineWidth = 1;

  const startX = Math.floor(-this.panX / this.scale / this.gridSize) * this.gridSize;
  const startY = Math.floor(-this.panY / this.scale / this.gridSize) * this.gridSize;
  const endX = startX + this.canvas.width / this.scale + this.gridSize;
  const endY = startY + this.canvas.height / this.scale + this.gridSize;

  for (let x = startX; x < endX; x += this.gridSize) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, startY);
    this.ctx.lineTo(x, endY);
    this.ctx.stroke();
  }

  // ... vertical lines
}

snapToGrid(value: number): number {
  if (!this.snapToGrid) return value;
  return Math.round(value / this.gridSize) * this.gridSize;
}
```

**Benefits:** Cleaner drawings, easier alignment

---

#### 5. Copy/Paste ⭐⭐

**What's needed:**

- Copy selected shapes (Ctrl+C)
- Paste with offset (Ctrl+V)
- Duplicate (Ctrl+D)

**Implementation:**

```typescript
private clipboard: Shape[] = [];

copy() {
  this.clipboard = this.selectedShapes.map(index =>
    ({ ...this.existingShape[index] })
  );
}

paste() {
  const offset = 20; // pixels
  const newShapes = this.clipboard.map(shape => {
    const cloned = { ...shape };
    if ('x' in cloned) {
      cloned.x += offset;
      cloned.y += offset;
    }
    return cloned;
  });

  this.existingShape.push(...newShapes);
  this.clearCanvas();
}
```

**Benefits:** Faster workflow for repetitive elements

---

#### 6. Shape Rotation ⭐⭐

**What's needed:**

- Rotate handle on selected shapes
- Keyboard shortcuts (R key)
- Rotate in 15° increments with Shift

**Implementation:**

```typescript
type Shape = {
  // ... existing props
  rotation?: number; // radians
}

drawShape(shape: Shape) {
  if (shape.rotation) {
    this.ctx.save();
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(shape.rotation);
    this.ctx.translate(-centerX, -centerY);
  }

  // ... draw shape

  if (shape.rotation) {
    this.ctx.restore();
  }
}
```

**Benefits:** More expressive drawings

---

#### 7. Color Picker ⭐⭐

**Current State:** Fixed color palette  
**What's needed:**

- Custom color picker
- Recent colors history
- Color presets

**Implementation:**

```typescript
// Add color input
<input
  type="color"
  value={strokeFill}
  onChange={(e) => setStrokeFill(e.target.value)}
/>

// Store recent colors
const [recentColors, setRecentColors] = useState<string[]>([]);

const addRecentColor = (color: string) => {
  setRecentColors(prev =>
    [color, ...prev.filter(c => c !== color)].slice(0, 10)
  );
};
```

**Benefits:** More color options, personalization

---

### Low Priority (Nice to Have)

#### 8. Layers/Z-Index ⭐

**What's needed:**

- Bring to front / Send to back
- Layer panel
- Reorder shapes

**Implementation:**

```typescript
bringToFront(index: number) {
  const shape = this.existingShape.splice(index, 1)[0];
  this.existingShape.push(shape);
  this.clearCanvas();
}

sendToBack(index: number) {
  const shape = this.existingShape.splice(index, 1)[0];
  this.existingShape.unshift(shape);
  this.clearCanvas();
}
```

**Benefits:** Better control over overlapping shapes

---

#### 9. Shape Library Templates ⭐

**What's needed:**

- Pre-made shapes (flowchart symbols, icons)
- Drag from sidebar
- Custom shape creation

**Benefits:** Faster creation of common diagrams

---

#### 10. Collaboration Features ⭐

**What's needed:**

- User cursors (show others' mouse positions)
- User avatars
- Live user list
- Chat or comments

**Implementation:**

```typescript
// Broadcast cursor position (throttled)
this.socket.send(JSON.stringify({
  type: "cursor",
  data: { x, y, userId, userName },
  roomId: this.roomId
}));

// Render others' cursors
drawCursor(x: number, y: number, userName: string, color: string) {
  this.ctx.fillStyle = color;
  this.ctx.beginPath();
  this.ctx.moveTo(x, y);
  this.ctx.lineTo(x + 10, y + 10);
  this.ctx.lineTo(x, y + 14);
  this.ctx.fill();

  // Name label
  this.ctx.fillText(userName, x + 15, y);
}
```

**Benefits:** Better awareness of collaborators

---

## Performance Enhancements

### 1. Virtualization / Culling

**Problem:** All shapes are rendered even if off-screen  
**Solution:** Only render shapes in viewport

```typescript
isShapeInViewport(shape: Shape): boolean {
  const viewportMinX = -this.panX / this.scale;
  const viewportMaxX = viewportMinX + this.canvas.width / this.scale;
  const viewportMinY = -this.panY / this.scale;
  const viewportMaxY = viewportMinY + this.canvas.height / this.scale;

  // Check if shape bounding box intersects viewport
  return !(
    shape.maxX < viewportMinX ||
    shape.minX > viewportMaxX ||
    shape.maxY < viewportMinY ||
    shape.minY > viewportMaxY
  );
}

clearCanvas() {
  // ... clearing logic

  this.existingShape
    .filter(shape => this.isShapeInViewport(shape))
    .forEach(shape => this.drawShape(shape));
}
```

---

### 2. Offscreen Canvas for Static Content

**Problem:** Redrawing all shapes on every mousemove  
**Solution:** Pre-render static shapes to offscreen canvas

```typescript
private offscreenCanvas: HTMLCanvasElement;
private needsOffscreenRedraw: boolean = true;

updateOffscreenCanvas() {
  const ctx = this.offscreenCanvas.getContext('2d')!;
  ctx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

  this.existingShape.forEach(shape => {
    this.drawShapeOnContext(ctx, shape);
  });

  this.needsOffscreenRedraw = false;
}

clearCanvas() {
  if (this.needsOffscreenRedraw) {
    this.updateOffscreenCanvas();
  }

  // Blit offscreen canvas
  this.ctx.drawImage(this.offscreenCanvas, 0, 0);

  // Draw current preview shape on top
  if (this.isDrawing) {
    this.drawPreviewShape();
  }
}
```

---

### 3. WebGL Rendering

**Problem:** Canvas 2D API can be slow for many shapes  
**Solution:** Use WebGL for hardware acceleration

**Complexity:** High  
**Benefit:** 10-100x performance improvement for complex scenes

---

## UI/UX Improvements

### 1. Keyboard Shortcuts Overlay

- Show all shortcuts on press of `?` key
- Searchable shortcut list
- Customizable bindings

### 2. Tooltips on Hover

- Show tool names on hover
- Keyboard shortcut hints
- Feature descriptions

### 3. Mobile Support

- Touch events for drawing
- Pinch-to-zoom
- Touch-friendly UI
- Mobile-optimized toolbar

### 4. Dark/Light Mode Toggle

- User preference
- Auto-detect system preference
- Different canvas backgrounds

### 5. Undo/Redo History Panel

- Visual timeline of actions
- Jump to any point in history
- Named checkpoints

---

## Architecture Improvements

### 1. State Management

**Current:** Props drilling  
**Better:** Context API or Zustand

```typescript
// Zustand store
import create from "zustand";

type CanvasStore = {
  tool: Tool;
  strokeFill: string;
  // ...
  setTool: (tool: Tool) => void;
  // ...
};

const useCanvasStore = create<CanvasStore>((set) => ({
  tool: "rect",
  setTool: (tool) => set({ tool }),
  // ...
}));
```

**Benefits:** Cleaner code, easier state access

---

### 2. Command Pattern for Undo/Redo

**Current:** Storing full state snapshots  
**Better:** Store commands and reverse them

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class AddShapeCommand implements Command {
  constructor(private shape: Shape) {}

  execute() {
    game.existingShape.push(this.shape);
    game.clearCanvas();
  }

  undo() {
    game.existingShape.pop();
    game.clearCanvas();
  }
}

// More memory-efficient than storing full state
```

---

### 3. Plugin System

**Goal:** Allow third-party extensions

```typescript
interface Plugin {
  name: string;
  init(game: Game): void;
  tools?: Tool[];
  commands?: Command[];
}

const fancyShapesPlugin: Plugin = {
  name: "Fancy Shapes",
  tools: [
    { id: "star", icon: StarIcon, draw: drawStar },
    { id: "heart", icon: HeartIcon, draw: drawHeart },
  ],
  init(game) {
    game.registerTools(this.tools);
  },
};
```

**Benefits:** Extensibility without modifying core

---

## Backend Integration

### 1. Persistent Storage

- Save drawings to database
- Load previous drawings
- Version history
- Auto-save

### 2. User Dashboard

- List of user's drawings
- Thumbnail previews
- Search and filters
- Shared drawings

### 3. Sharing & Permissions

- Public/private drawings
- Share links
- Collaborative editing permissions
- Embed code generation

---

## Documentation & Developer Experience

### 1. Interactive Playground

- Live code editor
- Shape gallery with code examples
- API documentation with try-it sections

### 2. Testing

- Unit tests for Game.ts methods
- Integration tests for components
- E2E tests for user flows
- Visual regression tests

### 3. Storybook

- Component library documentation
- Interactive component demos
- Design system documentation

---

## Estimated Effort

| Feature          | Difficulty | Time Estimate | Impact |
| ---------------- | ---------- | ------------- | ------ |
| Selection Tool   | Medium     | 3-5 days      | High   |
| Text Input       | Easy       | 1-2 days      | High   |
| Export PNG/SVG   | Medium     | 2-3 days      | High   |
| Grid & Snap      | Easy       | 1 day         | Medium |
| Copy/Paste       | Easy       | 1 day         | Medium |
| Rotation         | Medium     | 2-3 days      | Medium |
| Color Picker     | Easy       | 1 day         | Low    |
| Layers           | Medium     | 2 days        | Low    |
| User Cursors     | Medium     | 2-3 days      | Medium |
| Offscreen Canvas | Easy       | 1 day         | High   |
| WebGL Rendering  | Hard       | 2-3 weeks     | High   |

---

## Getting Started

Want to contribute? Pick a feature and:

1. Read the relevant documentation
2. Create a feature branch
3. Implement with tests
4. Submit a pull request
5. Update documentation

**Good first issues:**

- Color picker
- Grid toggle
- Tooltips
- Keyboard shortcuts overlay
