# Troubleshooting Guide

This guide helps you diagnose and fix common issues with the Excelidraw application.

## Common Issues

### 1. Canvas Page Shows "Failed to parse URL from undefined"

**Symptom:** When navigating to `/room/test`, you see an error about undefined URL.

**Cause:** Missing environment variables. The application can't find the WebSocket server URL.

**Solution:**

1. Create `.env.local` file in the frontend root:

```bash
cd apps/excelidraw-frontend
touch .env.local
```

2. Add the required environment variables:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_HTTP_URL=http://localhost:3001
```

3. Restart the dev server:

```bash
pnpm dev
```

**Prevention:** Always copy `env.example` to `.env.local` when setting up the project.

---

### 2. Tailwind CSS Styles Not Working

**Symptom:** Page looks unstyled, default browser styles only.

**Possible Causes:**

#### A. CSS File Not Imported

**Check:** Look at `app/layout.tsx`

```typescript
import "./global.css"; // This must be present
```

**Fix:** Add the import if missing.

#### B. Tailwind Not Configured

**Check:** `tailwind.config.ts` exists and has correct content paths

```typescript
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // ...
};
```

**Fix:** Ensure all component directories are included in `content`.

#### C. PostCSS Not Processing

**Check:** `postcss.config.ts` has Tailwind plugin

```typescript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Fix:** Install PostCSS and Tailwind:

```bash
pnpm add -D tailwindcss postcss autoprefixer
```

#### D. Build Cache Issue

**Fix:** Clear Next.js cache and rebuild:

```bash
rm -rf .next
pnpm dev
```

---

### 3. WebSocket Connection Fails

**Symptom:** Cannot draw or see others' drawings in real-time.

**Diagnosis:**

1. Check browser console for WebSocket errors
2. Verify WebSocket server is running on port 8080
3. Check environment variables

**Solutions:**

#### A. Backend Not Running

```bash
# In backend directory
pnpm dev
```

#### B. Port Mismatch

Check `.env.local`:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8080  # Must match backend port
```

#### C. CORS Issues

If using a different domain/port, ensure backend allows connections:

```typescript
// In WebSocket server
wss.on("connection", (ws, req) => {
  // Check origin if needed
});
```

---

### 4. Shapes Not Syncing Between Users

**Symptom:** Drawing locally works, but others don't see your shapes.

**Diagnosis:**

1. Check if WebSocket is connected (browser console)
2. Verify room ID is the same for all users
3. Check for errors in WebSocket message handling

**Solutions:**

#### A. Different Room IDs

**Fix:** Ensure all users access the same URL:

```
✓ http://localhost:3000/room/myroom
✗ http://localhost:3000/room/myroom1 (different)
```

#### B. Message Format Issues

**Check:** Browser console for JSON parse errors

**Fix:** Ensure messages are properly stringified:

```typescript
this.socket.send(
  JSON.stringify({
    type: "draw",
    data: JSON.stringify({ shape }),
    roomId: this.roomId,
  }),
);
```

---

### 5. TypeScript Errors After Pulling Changes

**Symptom:** `tsc` or IDE shows type errors.

**Solutions:**

#### A. Outdated Dependencies

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### B. Type Mismatch in Shape

If you see errors like "Type 'X' is not assignable to type 'Shape'":

**Check:** All shape objects include all required properties:

```typescript
const shape = {
  type: "rect",
  x,
  y,
  width,
  height,
  strokeWidth,
  strokeFill,
  bgFill,
  opacity, // Don't forget new properties
  strokeStyle, // Don't forget new properties
};
```

#### C. IDE Cache

**VS Code:** Reload window (Cmd/Ctrl + Shift + P → "Reload Window")

---

### 6. Build Fails

**Symptom:** `pnpm build` fails with errors.

**Common Causes:**

#### A. ESLint Errors

**Check:** Build output for linting errors

**Fix:** Run linter and fix issues:

```bash
pnpm lint
```

**Quick fix:** Disable specific rules in `eslint.config.js` (not recommended):

```javascript
module.exports = {
  rules: {
    "@typescript-eslint/no-unused-vars": "warn", // Change error to warning
  },
};
```

#### B. Missing Dependencies

**Fix:**

```bash
pnpm install
```

#### C. Port Already in Use

**Symptom:** "Port 3000 is already in use"

**Fix:**

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm dev
```

---

### 7. Canvas is Blank

**Symptom:** Canvas element exists but nothing renders.

**Diagnosis:**

1. Check browser console for errors
2. Verify Game instance is created
3. Check if initial shapes load

**Solutions:**

#### A. Canvas Context Not Initialized

**Check:** `Game.ts` constructor

```typescript
this.ctx = canvas.getContext("2d")!;
if (!this.ctx) {
  console.error("Canvas context not available");
}
```

#### B. No Initial Draw Call

**Fix:** Ensure `clearCanvas()` is called on init:

```typescript
constructor(...) {
  // ... initialization
  this.clearCanvas(); // Draw initial state
}
```

#### C. WebGL Context Contamination

**Fix:** Ensure you're not mixing WebGL and 2D contexts on same canvas.

---

### 8. Undo/Redo Not Working

**Symptom:** Clicking undo/redo buttons does nothing.

**Diagnosis:**

1. Check if buttons are connected to Game instance
2. Verify history is being populated
3. Check console for errors

**Solutions:**

#### A. Game Instance Not Passed

**Check:** Toolbar receives `game` prop:

```tsx
<Toolbar
  activeTool={tool}
  onToolChange={setTool}
  game={gameRef.current} // Must not be null
/>
```

#### B. History Not Saving

**Fix:** Call `saveToHistory()` after operations:

```typescript
mouseUpHandler() {
  // ... create shape
  this.existingShape.push(shape);
  this.saveToHistory(); // Add this
}
```

---

### 9. Performance Issues / Lag

**Symptom:** Drawing feels slow or choppy.

**Solutions:**

#### A. Too Many Shapes

**Current Limitation:** Canvas redraws everything on each frame

**Workaround:**

- Use fewer shapes
- Simplify complex pencil paths
- Clear canvas occasionally

**Future Fix:** Implement viewport culling (see enhancement roadmap)

#### B. Large Canvas Size

**Fix:** Reduce canvas dimensions in CSS/HTML

#### C. High-DPI Display

**Issue:** Retina displays have 4x pixels

**Partial Fix:** Limit canvas pixel ratio:

```typescript
const dpr = Math.min(window.devicePixelRatio, 2); // Cap at 2x
canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);
```

---

### 10. Mobile/Touch Not Working

**Symptom:** Can't draw on mobile devices.

**Cause:** Only mouse events are implemented.

**Solution:** Add touch event handlers:

```typescript
canvas.addEventListener('touchstart', this.handleTouchStart);
canvas.addEventListener('touchmove', this.handleTouchMove);
canvas.addEventListener('touchend', this.handleTouchEnd);

handleTouchStart(e: TouchEvent) {
  e.preventDefault();
  const touch = e.touches[0];
  this.mouseDownHandler({
    clientX: touch.clientX,
    clientY: touch.clientY,
  } as MouseEvent);
}
```

---

## Debugging Tips

### Enable Verbose Logging

Add debug logs in Game.ts:

```typescript
private debug = true;

log(...args: any[]) {
  if (this.debug) {
    console.log('[Game]', ...args);
  }
}

mouseDownHandler(e: MouseEvent) {
  this.log('Mouse down', { x: e.clientX, y: e.clientY });
  // ...
}
```

### Inspect Canvas State

In browser console:

```javascript
// Access Game instance from window (for debugging)
window.game = gameInstance;

// Then in console:
game.existingShape; // See all shapes
game.history; // See undo history
game.scale; // Current zoom level
```

### Network Tab for WebSocket

1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Click on WebSocket connection
4. View "Messages" tab to see all communication

### React DevTools

Install React DevTools extension to inspect:

- Component props
- State values
- Re-render counts

---

## Getting Help

If you're still stuck:

1. **Check Documentation:** Read relevant docs (architecture, canvas system, etc.)
2. **Search Issues:** Look for similar issues on GitHub
3. **Ask for Help:** Create a new issue with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, browser, Node version)
   - Screenshots if applicable

---

## Prevention

### Development Checklist

Before committing:

- [ ] Run `pnpm build` to check for errors
- [ ] Run `pnpm lint` to check code quality
- [ ] Test in multiple browsers
- [ ] Test with WebSocket disconnected
- [ ] Check console for warnings

### Testing

Add tests to catch issues early:

```typescript
// Example: Test shape creation
describe("Game", () => {
  it("creates rect shape with all properties", () => {
    const game = new Game(canvas, "room1", socket, [], callback);
    game.activeTool = "rect";

    // Simulate mouse events
    game.mouseDownHandler({ clientX: 0, clientY: 0 });
    game.mouseUpHandler({ clientX: 100, clientY: 100 });

    expect(game.existingShape).toHaveLength(1);
    expect(game.existingShape[0]).toHaveProperty("opacity");
    expect(game.existingShape[0]).toHaveProperty("strokeStyle");
  });
});
```
