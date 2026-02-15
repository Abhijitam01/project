import { getRoom } from "@/actions/getRoom"
import { Tool } from "@/canvas/Canvas";
import type { RoomData, RoomShapeRecord } from "@/types/room"

type StrokeStyle = "solid" | "dashed" | "dotted";
type ResizeHandle = "nw" | "ne" | "sw" | "se";
type ShapeBounds = { minX: number; minY: number; maxX: number; maxY: number };

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    strokeWidth: number;
    strokeFill: string;
    bgFill: string;
    opacity: number;
    strokeStyle: StrokeStyle;
} | {
    type: "ellipse";
    centerX: number,
    centerY: number,
    radX: number,
    radY: number
    strokeWidth: number;
    strokeFill: string; 
    bgFill: string;
    opacity: number;
    strokeStyle: StrokeStyle;
} | {
    type: "line";
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    strokeWidth: number;
    strokeFill: string; 
    opacity: number;
    strokeStyle: StrokeStyle;
} | {
    type: "arrow";
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    strokeWidth: number;
    strokeFill: string; 
    opacity: number;
    strokeStyle: StrokeStyle;
} | {
    type: "diamond";
    x: number;
    y: number;
    width: number;
    height: number;
    strokeWidth: number;
    strokeFill: string;
    bgFill: string;
    opacity: number;
    strokeStyle: StrokeStyle;
} | {
    type: "triangle";
    x: number;
    y: number;
    width: number;
    height: number;
    strokeWidth: number;
    strokeFill: string;
    bgFill: string;
    opacity: number;
    strokeStyle: StrokeStyle;
} | {
    type: "pencil"
    points : {x: number, y:number}[]
    strokeWidth: number;
    strokeFill: string; 
    opacity: number;
    strokeStyle: StrokeStyle;
} | {
    type: "text";
    x: number;
    y: number;
    text: string;
    fontSize: number;
    strokeFill: string;
    opacity: number;
}

export type PresenceUser = {
    id: string
    username: string
}

export class Game {

    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private roomId: string
    private socket: WebSocket
    private existingShape: Shape[]
    private clicked: boolean
    private room: RoomData
    private activeTool: Tool = "grab"
    private startX: number = 0
    private startY: number = 0
    private panX: number = 0
    private panY: number = 0
    private scale: number = 1
    private onScaleChangeCallback: (scale: number) => void;
    private onPresenceUpdateCallback?: (users: PresenceUser[]) => void;
    public outputScale: number = 1
    private  strokeWidth: number = 1   
    private  strokeFill: string = "rgba(255, 255, 255)"
    private  bgFill: string = "rgba(18, 18, 18)"
    private  opacity: number = 1
    private  strokeStyle: StrokeStyle = "solid"
    private  fontSize: number = 16
    private  history: Shape[][] = []
    private  historyStep: number = -1
    private  selectedShapeIndex: number | null = null
    private  hoveredShapeIndex: number | null = null
    private  hoveredResizeHandle: ResizeHandle | null = null
    private  activeResizeHandle: ResizeHandle | null = null
    private  isResizing: boolean = false
    private  resizeAnchor: { x: number; y: number } | null = null
    private  resizeOriginalBounds: ShapeBounds | null = null
    private  resizeOriginalShape: Shape | null = null
    private  isDragging: boolean = false
    private  dragOffsetX: number = 0
    private  dragOffsetY: number = 0
    private  minScale: number = 0.2
    private  maxScale: number = 4
    private  lastSnapshotAt: number = 0
    private  snapshotIntervalId: number | null = null
    private  remoteCursors: Record<string, { x: number; y: number; username: string; updatedAt: number }> = {}
    private  lastCursorSent: number = 0
    private  isPinching: boolean = false
    private  pinchDistance: number = 0
    private  touchPointerId: number | null = null
    private  gridSpacing: number = 36
    
    constructor(
        canvas: HTMLCanvasElement , 
        roomId: string , 
        socket: WebSocket, 
        room: RoomData,  
        onScaleChangeCallback: (scale: number) => void,
        onPresenceUpdateCallback?: (users: PresenceUser[]) => void
){
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")!
        this.roomId = roomId
        this.socket = socket
        this.clicked = false
        this.existingShape = []
        this.canvas.width = document.body.clientWidth
        this.canvas.height = document.body.clientHeight
        this.onScaleChangeCallback = onScaleChangeCallback;
        this.onPresenceUpdateCallback = onPresenceUpdateCallback;
        this.room = room
        this.init()
        this.initHandler()
        this.initMouseHandler()
        this.snapshotIntervalId = window.setInterval(() => this.persistSnapshot(), 10000)
        


    }

       async init()  {
        try {
            const room = await getRoom(this.room.roomName)
            const shapes: RoomShapeRecord[] = Array.isArray(room?.shape) ? room.shape : []
            shapes.forEach((shape)=>{
                try {
                    const parsed = JSON.parse(shape.data) as { shape?: Shape }
                    if (parsed?.shape) {
                        this.existingShape.push(parsed.shape)
                    }
                } catch (e) {
                    // ignore bad shape payloads
                }
            })
            if (this.existingShape.length === 0) {
                const snapshot = this.loadSnapshot()
                if (snapshot) {
                    this.existingShape = snapshot
                }
            }
            this.clearCanvas()
        } catch (e) {
            const snapshot = this.loadSnapshot()
            if (snapshot) {
                this.existingShape = snapshot
            }
            this.clearCanvas()
        }
    }

    initHandler(){
        this.socket.onmessage = (event) =>{
            const data = JSON.parse(event.data)

            if(data.type === "draw"){
                const parsedShape = JSON.parse(data.data)
                this.existingShape.push(parsedShape.shape)
                this.clearCanvas()
            }
            else if(data.type === "erase"){
                const parsedShape = JSON.parse(data.data)
                this.existingShape = this.existingShape.filter(
                    (shape) => JSON.stringify(shape) !== JSON.stringify(parsedShape.shape)
                );
              this.clearCanvas()
            }
            else if(data.type === "reset"){
                this.existingShape = []
                this.clearCanvas()
            }
            else if(data.type === "bulk_draw"){
                const payload = JSON.parse(data.data)
                const shapes = Array.isArray(payload?.shapes) ? payload.shapes : []
                if (shapes.length) {
                    this.existingShape = [...this.existingShape, ...shapes]
                    this.clearCanvas()
                }
            }
            else if(data.type === "cursor"){
                const payload = JSON.parse(data.data)
                this.updateRemoteCursor(payload)
                this.clearCanvas()
            }
            else if (data.type === "presence" && Array.isArray(data.users)) {
                this.onPresenceUpdateCallback?.(data.users)
            }

        }
    }



    initMouseHandler(){
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)
        this.canvas.addEventListener("mouseup", this.mouseUpHandler)
        this.canvas.addEventListener("wheel", this.mouseWheelHandler)
        this.canvas.addEventListener("touchstart", this.touchStartHandler, { passive: false })
        this.canvas.addEventListener("touchmove", this.touchMoveHandler, { passive: false })
        this.canvas.addEventListener("touchend", this.touchEndHandler)
        this.canvas.addEventListener("touchcancel", this.touchCancelHandler)
    }

    setTool(tool : Tool){
        this.activeTool = tool
        this.updateCursor()
    }

    setStrokeWidth(width: number){
        this.strokeWidth = width
        this.clearCanvas()
    }

    setStrokeFill(fill: string){
        this.strokeFill = fill
        this.clearCanvas()
    }

    setBgFill(fill: string){
        this.bgFill = fill
        this.clearCanvas()
    }

    setOpacity(opacity: number){
        this.opacity = opacity
        this.clearCanvas()
    }

    setStrokeStyle(style: StrokeStyle){
        this.strokeStyle = style
        this.clearCanvas()
    }

    setFontSize(size: number){
        this.fontSize = size
    }

    saveToHistory(){
        this.historyStep++
        this.history = this.history.slice(0, this.historyStep)
        this.history.push([...this.existingShape])
        this.persistSnapshot()
    }

    undo(){
        if(this.historyStep > 0){
            this.historyStep--
            const previousState = this.history[this.historyStep]
            if(previousState){
                this.existingShape = [...previousState]
                this.clearCanvas()
            }
        }
    }

    redo(){
        if(this.historyStep < this.history.length - 1){
            this.historyStep++
            const nextState = this.history[this.historyStep]
            if(nextState){
                this.existingShape = [...nextState]
                this.clearCanvas()
            }
        }
    }

    clearCanvas() {
        this.ctx.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
        this.ctx.clearRect(

            -this.panX / this.scale, 
            -this.panY / this.scale, 

            this.canvas.width / this.scale, 
            this.canvas.height/ this.scale);
        this.ctx.fillStyle = "rgba(18, 18, 18)"
        this.ctx.fillRect(  
            -this.panX / this.scale, 
            -this.panY / this.scale, 
            this.canvas.width/ this.scale, 
            this.canvas.height / this.scale);

        this.drawGrid()

        this.existingShape.map((shape: Shape)=>{
            if(shape.type == "rect"){
                this.drawRect(shape.x, shape.y, shape.width, shape.height, shape.strokeWidth, shape.strokeFill, shape.bgFill, shape.opacity, shape.strokeStyle);
            }
            else if (shape.type === "ellipse"){
                this.drawEllipse(shape.centerX , shape.centerY, shape.radX, shape.radY, shape.strokeWidth, shape.strokeFill, shape.bgFill, shape.opacity, shape.strokeStyle)
            }
            else if (shape.type === "line"){
                this.drawLine(shape.fromX, shape.fromY, shape.toX, shape.toY, shape.strokeWidth, shape.strokeFill, shape.opacity, shape.strokeStyle)
            }
            else if (shape.type === "arrow"){
                this.drawArrow(shape.fromX, shape.fromY, shape.toX, shape.toY, shape.strokeWidth, shape.strokeFill, shape.opacity, shape.strokeStyle)
            }
            else if (shape.type === "diamond"){
                this.drawDiamond(shape.x, shape.y, shape.width, shape.height, shape.strokeWidth, shape.strokeFill, shape.bgFill, shape.opacity, shape.strokeStyle)
            }
            else if (shape.type === "triangle"){
                this.drawTriangle(shape.x, shape.y, shape.width, shape.height, shape.strokeWidth, shape.strokeFill, shape.bgFill, shape.opacity, shape.strokeStyle)
            }
            else if (shape.type === "pencil"){
                this.drawPencil(shape.points, shape.strokeWidth, shape.strokeFill, shape.opacity, shape.strokeStyle)
            }
            else if (shape.type === "text"){
                this.drawText(shape.x, shape.y, shape.text, shape.fontSize, shape.strokeFill, shape.opacity)
            }
        })

        if (this.activeTool === "select") {
            if (this.selectedShapeIndex !== null) {
                const selectedShape = this.existingShape[this.selectedShapeIndex]
                if (selectedShape) {
                    this.drawSelectionOutline(selectedShape, true, this.activeResizeHandle || this.hoveredResizeHandle)
                }
            }
            if (
                this.hoveredShapeIndex !== null &&
                this.hoveredShapeIndex !== this.selectedShapeIndex
            ) {
                const hoveredShape = this.existingShape[this.hoveredShapeIndex]
                if (hoveredShape) {
                    this.drawSelectionOutline(hoveredShape, false, null)
                }
            }
        }

        this.drawRemoteCursors()

    
    }

    mouseDownHandler = (e : MouseEvent) => {
        this.clicked = true
        this.updateCursor()
        if (!this.isPinching) {
            this.queueCursor(e.clientX, e.clientY)
        }

        const { x, y } = this.transformPanScale(e.clientX, e.clientY);
        const snapped = this.activeTool === "pencil" ? { x, y } : { x: this.snapToGrid(x), y: this.snapToGrid(y) }

        this.startX = snapped.x
        this.startY = snapped.y

        // Handle selection and dragging with select tool
        if (this.activeTool === "select") {
            if (this.selectedShapeIndex !== null) {
                const selectedShape = this.existingShape[this.selectedShapeIndex]
                const selectedBounds = selectedShape ? this.getShapeBounds(selectedShape) : null
                const resizeHandle = selectedBounds ? this.detectResizeHandle(selectedBounds, x, y) : null
                if (resizeHandle && selectedShape && selectedBounds) {
                    this.isResizing = true
                    this.activeResizeHandle = resizeHandle
                    this.hoveredResizeHandle = resizeHandle
                    this.resizeOriginalBounds = { ...selectedBounds }
                    this.resizeOriginalShape = this.cloneShape(selectedShape)
                    this.resizeAnchor = this.getOppositeCorner(selectedBounds, resizeHandle)
                    this.updateCursor()
                    this.clearCanvas()
                    return
                }
            }

            const hitIndex = this.findShapeIndexAtPoint(x, y)
            if (hitIndex !== -1) {
                const shape = this.existingShape[hitIndex]
                if (!shape) return
                this.selectedShapeIndex = hitIndex
                this.hoveredShapeIndex = hitIndex
                this.hoveredResizeHandle = null
                this.isDragging = true
                
                // Calculate offset for smooth dragging with type guards
                if (shape.type === "rect" && 'x' in shape && 'y' in shape) {
                    this.dragOffsetX = x - shape.x
                    this.dragOffsetY = y - shape.y
                } else if (shape.type === "diamond" && 'x' in shape && 'y' in shape) {
                    this.dragOffsetX = x - shape.x
                    this.dragOffsetY = y - shape.y
                } else if (shape.type === "triangle" && 'x' in shape && 'y' in shape) {
                    this.dragOffsetX = x - shape.x
                    this.dragOffsetY = y - shape.y
                } else if (shape.type === "ellipse" && 'centerX' in shape && 'centerY' in shape) {
                    this.dragOffsetX = x - shape.centerX
                    this.dragOffsetY = y - shape.centerY
                } else if (shape.type === "line" && 'fromX' in shape && 'fromY' in shape) {
                    this.dragOffsetX = x - shape.fromX
                    this.dragOffsetY = y - shape.fromY
                } else if (shape.type === "arrow" && 'fromX' in shape && 'fromY' in shape) {
                    this.dragOffsetX = x - shape.fromX
                    this.dragOffsetY = y - shape.fromY
                } else if (shape.type === "text" && 'x' in shape && 'y' in shape) {
                    this.dragOffsetX = x - shape.x
                    this.dragOffsetY = y - shape.y
                }
                this.updateCursor()
                this.clearCanvas()
                return
            }
            // Clicked on empty space - deselect
            this.selectedShapeIndex = null
            this.hoveredShapeIndex = null
            this.hoveredResizeHandle = null
            this.activeResizeHandle = null
            this.updateCursor()
            this.clearCanvas()
        }
        else if(this.activeTool === "pencil"){
            this.existingShape.push({
                type: "pencil",
                points: [{x , y}],
                strokeWidth: this.strokeWidth,
                strokeFill: this.strokeFill,
                opacity: this.opacity,
                strokeStyle: this.strokeStyle,
            })
        }
        else if (this.activeTool === "erase") {
            this.erase(x  , y);
        } else if (this.activeTool === "grab") {
            this.startX = e.clientX;
            this.startY = e.clientY;
        }
    }

    mouseMoveHandler = (e: MouseEvent)=>{
        if (this.isPinching) {
            return
        }
        this.queueCursor(e.clientX, e.clientY)

        if (!this.clicked) {
            if (this.activeTool === "select") {
                const { x, y } = this.transformPanScale(e.clientX, e.clientY)
                let nextHandle: ResizeHandle | null = null
                if (this.selectedShapeIndex !== null) {
                    const selectedShape = this.existingShape[this.selectedShapeIndex]
                    const bounds = selectedShape ? this.getShapeBounds(selectedShape) : null
                    nextHandle = bounds ? this.detectResizeHandle(bounds, x, y) : null
                }
                const hitIndex = this.findShapeIndexAtPoint(x, y)
                const nextHover = hitIndex === -1 ? null : hitIndex
                if (this.hoveredShapeIndex !== nextHover || this.hoveredResizeHandle !== nextHandle) {
                    this.hoveredShapeIndex = nextHover
                    this.hoveredResizeHandle = nextHandle
                    this.clearCanvas()
                }
            } else if (this.hoveredShapeIndex !== null || this.hoveredResizeHandle !== null) {
                this.hoveredShapeIndex = null
                this.hoveredResizeHandle = null
                this.clearCanvas()
            }
            this.updateCursor()
        }

        if(this.clicked){

            const {x ,y} = this.transformPanScale(e.clientX , e.clientY)
            const previewX = this.activeTool === "pencil" ? x : this.snapToGrid(x)
            const previewY = this.activeTool === "pencil" ? y : this.snapToGrid(y)

            if (
                this.isResizing &&
                this.selectedShapeIndex !== null &&
                this.resizeAnchor &&
                this.resizeOriginalBounds &&
                this.resizeOriginalShape
            ) {
                const nextBounds = this.buildBoundsFromAnchor(this.resizeAnchor, x, y)
                const resizedShape = this.resizeShapeToBounds(this.resizeOriginalShape, this.resizeOriginalBounds, nextBounds)
                this.existingShape[this.selectedShapeIndex] = resizedShape
                this.clearCanvas()
                this.updateCursor()
                return
            }

            // Handle dragging selected shape
            if (this.isDragging && this.selectedShapeIndex !== null) {
                const shape = this.existingShape[this.selectedShapeIndex]
                if (!shape) return

                const newX = x - this.dragOffsetX
                const newY = y - this.dragOffsetY

                // Update shape position based on type
                if (shape.type === "rect" || shape.type === "diamond" || shape.type === "triangle") {
                    shape.x = newX
                    shape.y = newY
                } else if (shape.type === "ellipse") {
                    shape.centerX = newX
                    shape.centerY = newY
                } else if (shape.type === "line" || shape.type === "arrow") {
                    const deltaX = newX - shape.fromX
                    const deltaY = newY - shape.fromY
                    shape.fromX = newX
                    shape.fromY = newY
                    shape.toX += deltaX
                    shape.toY += deltaY
                } else if (shape.type === "text") {
                    shape.x = newX
                    shape.y = newY
                } else if (shape.type === "pencil") {
                    const deltaX = newX - (shape.points[0]?.x || 0)
                    const deltaY = newY - (shape.points[0]?.y || 0)
                    shape.points = shape.points.map(p => ({
                        x: p.x + deltaX,
                        y: p.y + deltaY
                    }))
                }

                this.clearCanvas()
                return
            }

            const width = previewX - this.startX
            const height = previewY - this.startY
    
            this.clearCanvas()

            const activeTool = this.activeTool

            if(activeTool === "rect"){
                this.drawRect(
                    this.startX,
                    this.startY,
                    width,
                    height,
                    this.strokeWidth,
                    this.strokeFill,
                    this.bgFill,
                    this.opacity,
                    this.strokeStyle
                )
            } else if(activeTool === "ellipse"){
                const centerX = this.startX + width / 2;
                const centerY = this.startY + height / 2;
                const radX = Math.abs(width / 2);
                const radY = Math.abs(height / 2);
                this.drawEllipse(
                    centerX,
                    centerY,
                    radX,
                    radY,
                    this.strokeWidth,
                    this.strokeFill,    
                    this.bgFill,
                    this.opacity,
                    this.strokeStyle
                )
            } else if(activeTool === "diamond"){
                this.drawDiamond(
                    this.startX,
                    this.startY,
                    width,
                    height,
                    this.strokeWidth,
                    this.strokeFill,
                    this.bgFill,
                    this.opacity,
                    this.strokeStyle
                )
            } else if(activeTool === "triangle"){
                this.drawTriangle(
                    this.startX,
                    this.startY,
                    width,
                    height,
                    this.strokeWidth,
                    this.strokeFill,
                    this.bgFill,
                    this.opacity,
                    this.strokeStyle
                )
            } else if(activeTool === "line"){
                this.drawLine(this.startX, this.startY, previewX, previewY, this.strokeWidth, this.strokeFill, this.opacity, this.strokeStyle)
            } else if(activeTool === "arrow"){
                this.drawArrow(this.startX, this.startY, previewX, previewY, this.strokeWidth, this.strokeFill, this.opacity, this.strokeStyle)
            } else if(activeTool === "pencil"){
                const currentShape = this.existingShape[this.existingShape.length - 1]
                if(currentShape?.type === "pencil" ){
                    currentShape.points.push({x , y})
                    this.drawPencil(currentShape.points, this.strokeWidth, this.strokeFill, this.opacity, this.strokeStyle)
                }
            } else if (activeTool === "erase"){
                this.erase(x, y)
            }   
            else if (activeTool === "grab"){
                const { x: transformedX, y: transformedY } = this.transformPanScale(e.clientX, e.clientY);
                const { x: startTransformedX, y: startTransformedY } = this.transformPanScale(this.startX, this.startY);
            
                const deltaX = transformedX - startTransformedX;
                const deltaY = transformedY - startTransformedY;
            
                this.panX += deltaX * this.scale;
                this.panY += deltaY * this.scale;
                this.startX = e.clientX;
                this.startY = e.clientY;
                this.clearCanvas();
            }

            if (!["grab", "erase", "pencil", "select"].includes(activeTool)) {
                this.drawAlignmentGuides(previewX, previewY)
            }
        }
    }


    // Collision Detection => Chat GPT
    isPointInShape(x: number, y: number, shape: Shape): boolean {
        const tolerance = 5; 
    
        if (shape.type === "rect") {
            const startX = Math.min(shape.x, shape.x + shape.width);
            const endX = Math.max(shape.x, shape.x + shape.width);
            const startY = Math.min(shape.y, shape.y + shape.height);
            const endY = Math.max(shape.y, shape.y + shape.height);
    
            return (
                x >= startX - tolerance &&
                x <= endX + tolerance &&
                y >= startY - tolerance &&
                y <= endY + tolerance
            );
        } else if (shape.type === "ellipse") {
            const dx = x - shape.centerX;
            const dy = y - shape.centerY;
            const normalized = 
                (dx * dx) / ((shape.radX + tolerance) * (shape.radX + tolerance)) +
                (dy * dy) / ((shape.radY + tolerance) * (shape.radY + tolerance));
            return normalized <= 1;
        } else if (shape.type === "line" || shape.type === "arrow") {
            const lineLength = Math.hypot(
                shape.toX - shape.fromX,
                shape.toY - shape.fromY
            );
            const distance =
                Math.abs(
                    (shape.toY - shape.fromY) * x -
                    (shape.toX - shape.fromX) * y +
                    shape.toX * shape.fromY -
                    shape.toY * shape.fromX
                ) / lineLength;
    
            const withinLineBounds =
                x >= Math.min(shape.fromX, shape.toX) - tolerance &&
                x <= Math.max(shape.fromX, shape.toX) + tolerance &&
                y >= Math.min(shape.fromY, shape.toY) - tolerance &&
                y <= Math.max(shape.fromY, shape.toY) + tolerance;
    
            return distance <= tolerance && withinLineBounds;
        } else if (shape.type === "diamond") {
            const centerX = shape.x + shape.width / 2
            const centerY = shape.y + shape.height / 2
            const normalizedX = Math.abs(x - centerX) / (Math.abs(shape.width) / 2 + tolerance)
            const normalizedY = Math.abs(y - centerY) / (Math.abs(shape.height) / 2 + tolerance)
            return normalizedX + normalizedY <= 1
        } else if (shape.type === "triangle") {
            const a = { x: shape.x + shape.width / 2, y: shape.y }
            const b = { x: shape.x + shape.width, y: shape.y + shape.height }
            const c = { x: shape.x, y: shape.y + shape.height }
            const area = Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2)
            const area1 = Math.abs((x * (b.y - c.y) + b.x * (c.y - y) + c.x * (y - b.y)) / 2)
            const area2 = Math.abs((a.x * (y - c.y) + x * (c.y - a.y) + c.x * (a.y - y)) / 2)
            const area3 = Math.abs((a.x * (b.y - y) + b.x * (y - a.y) + x * (a.y - b.y)) / 2)
            return Math.abs(area - (area1 + area2 + area3)) <= tolerance * 2
        } else if (shape.type === "pencil") {
            return shape.points.some(
                (point) => Math.hypot(point.x - x, point.y - y) <= tolerance
            );
        } else if (shape.type === "text") {
            const textWidth = shape.text.length * shape.fontSize * 0.6
            return (
                x >= shape.x - tolerance &&
                x <= shape.x + textWidth + tolerance &&
                y >= shape.y - tolerance &&
                y <= shape.y + shape.fontSize + tolerance
            )
        }
    
        return false;
    }
    


    transformPanScale(clientX:number,clientY:number) : {x:number ; y:number}{
        const x = (clientX - this.panX) / this.scale
        const y = (clientY - this.panY) / this.scale
        return {x ,y}
    }
    




    applyStrokeStyle(strokeStyle: StrokeStyle) {
        if (strokeStyle === "dashed") {
            this.ctx.setLineDash([10, 5]);
        } else if (strokeStyle === "dotted") {
            this.ctx.setLineDash([2, 3]);
        } else {
            this.ctx.setLineDash([]);
        }
    }

    private drawGrid() {
        const viewWidth = this.canvas.width / this.scale
        const viewHeight = this.canvas.height / this.scale
        const startX = -this.panX / this.scale
        const startY = -this.panY / this.scale
        const endX = startX + viewWidth
        const endY = startY + viewHeight
        this.ctx.save()
        this.ctx.strokeStyle = "rgba(255,255,255,0.03)"
        this.ctx.lineWidth = 1 / this.scale
        this.ctx.setLineDash([4 / this.scale, 4 / this.scale])
        const startGridX = Math.floor(startX / this.gridSpacing) * this.gridSpacing
        const startGridY = Math.floor(startY / this.gridSpacing) * this.gridSpacing
        for (let x = startGridX; x <= endX; x += this.gridSpacing) {
            this.ctx.beginPath()
            this.ctx.moveTo(x, startY)
            this.ctx.lineTo(x, endY)
            this.ctx.stroke()
        }
        for (let y = startGridY; y <= endY; y += this.gridSpacing) {
            this.ctx.beginPath()
            this.ctx.moveTo(startX, y)
            this.ctx.lineTo(endX, y)
            this.ctx.stroke()
        }
        this.ctx.restore()
    }

    private drawRemoteCursors() {
        this.pruneCursors()
        this.ctx.save()
        this.ctx.lineWidth = 1 / this.scale
        Object.values(this.remoteCursors).forEach((cursor) => {
            this.ctx.beginPath()
            this.ctx.fillStyle = "rgba(255,255,255,0.6)"
            this.ctx.strokeStyle = "rgba(0,0,0,0.6)"
            this.ctx.arc(cursor.x, cursor.y, 6, 0, Math.PI * 2)
            this.ctx.fill()
            this.ctx.stroke()
            this.ctx.fillStyle = "rgba(255,255,255,0.9)"
            this.ctx.font = `${12 / this.scale}px Inter, Arial, sans-serif`
            this.ctx.fillText(cursor.username, cursor.x + 8 / this.scale, cursor.y - 8 / this.scale)
        })
        this.ctx.restore()
    }

    private pruneCursors() {
        const now = Date.now()
        Object.entries(this.remoteCursors).forEach(([key, cursor]) => {
            if (now - cursor.updatedAt > 2500) {
                delete this.remoteCursors[key]
            }
        })
    }

    private updateRemoteCursor(payload: { userId: string; username?: string; x: number; y: number }) {
        if (!payload?.userId) return
        if (!Number.isFinite(payload.x) || !Number.isFinite(payload.y)) return
        this.remoteCursors[payload.userId] = {
            x: payload.x,
            y: payload.y,
            username: payload.username || "User",
            updatedAt: Date.now()
        }
    }

    private drawAlignmentGuides(x: number, y: number) {
        this.ctx.save()
        this.ctx.strokeStyle = "rgba(255,255,255,0.12)"
        this.ctx.lineWidth = 1 / this.scale
        this.ctx.setLineDash([6 / this.scale, 6 / this.scale])
        const viewWidth = this.canvas.width / this.scale
        const viewHeight = this.canvas.height / this.scale
        this.ctx.beginPath()
        this.ctx.moveTo(x, y - viewHeight)
        this.ctx.lineTo(x, y + viewHeight)
        this.ctx.moveTo(x - viewWidth, y)
        this.ctx.lineTo(x + viewWidth, y)
        this.ctx.stroke()
        this.ctx.restore()
    }

    private snapToGrid(value: number) {
        return Math.round(value / this.gridSpacing) * this.gridSpacing
    }

    private queueCursor(clientX: number, clientY: number) {
        const now = performance.now()
        if (now - this.lastCursorSent < 40) {
            return
        }
        this.lastCursorSent = now
        this.sendCursor(clientX, clientY)
    }

    private sendCursor(clientX: number, clientY: number) {
        const { x, y } = this.transformPanScale(clientX, clientY)
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            return
        }
        if (this.socket.readyState !== WebSocket.OPEN) {
            return
        }
        this.socket.send(JSON.stringify({
            type: "cursor",
            data: JSON.stringify({ x, y }),
            roomId: this.roomId
        }))
    }

    private findShapeIndexAtPoint(x: number, y: number) {
        for (let i = this.existingShape.length - 1; i >= 0; i--) {
            const shape = this.existingShape[i]
            if (shape && this.isPointInShape(x, y, shape)) {
                return i
            }
        }
        return -1
    }

    private updateCursor() {
        if (this.activeTool === "grab") {
            this.canvas.style.cursor = this.clicked ? "grabbing" : "grab"
            return
        }
        if (this.activeTool === "erase") {
            this.canvas.style.cursor = "crosshair"
            return
        }
        if (this.activeTool === "select") {
            if (this.activeResizeHandle) {
                this.canvas.style.cursor = this.resizeCursor(this.activeResizeHandle)
                return
            }
            if (this.hoveredResizeHandle) {
                this.canvas.style.cursor = this.resizeCursor(this.hoveredResizeHandle)
                return
            }
            this.canvas.style.cursor = this.isDragging || this.hoveredShapeIndex !== null ? "move" : "default"
            return
        }
        this.canvas.style.cursor = "crosshair"
    }

    private drawSelectionOutline(shape: Shape, selected: boolean, activeHandle: ResizeHandle | null) {
        const bounds = this.getShapeBounds(shape)
        if (!bounds) return

        const pad = 6 / this.scale
        const expanded: ShapeBounds = {
            minX: bounds.minX - pad,
            minY: bounds.minY - pad,
            maxX: bounds.maxX + pad,
            maxY: bounds.maxY + pad,
        }
        this.ctx.save()
        this.ctx.lineWidth = 1 / this.scale
        this.ctx.strokeStyle = selected ? "rgba(99, 172, 255, 0.95)" : "rgba(99, 172, 255, 0.55)"
        this.ctx.setLineDash(selected ? [] : [6 / this.scale, 4 / this.scale])
        this.ctx.strokeRect(
            expanded.minX,
            expanded.minY,
            Math.max(expanded.maxX - expanded.minX, 10 / this.scale),
            Math.max(expanded.maxY - expanded.minY, 10 / this.scale)
        )
        if (selected) {
            this.drawResizeHandles(expanded, activeHandle)
        }
        this.ctx.restore()
    }

    private getShapeBounds(shape: Shape): ShapeBounds | null {
        if (shape.type === "rect" || shape.type === "diamond" || shape.type === "triangle") {
            const minX = Math.min(shape.x, shape.x + shape.width)
            const maxX = Math.max(shape.x, shape.x + shape.width)
            const minY = Math.min(shape.y, shape.y + shape.height)
            const maxY = Math.max(shape.y, shape.y + shape.height)
            return { minX, minY, maxX, maxY }
        }
        if (shape.type === "ellipse") {
            return {
                minX: shape.centerX - shape.radX,
                minY: shape.centerY - shape.radY,
                maxX: shape.centerX + shape.radX,
                maxY: shape.centerY + shape.radY,
            }
        }
        if (shape.type === "line" || shape.type === "arrow") {
            return {
                minX: Math.min(shape.fromX, shape.toX),
                minY: Math.min(shape.fromY, shape.toY),
                maxX: Math.max(shape.fromX, shape.toX),
                maxY: Math.max(shape.fromY, shape.toY),
            }
        }
        if (shape.type === "pencil") {
            const first = shape.points[0]
            if (!first) return null
            let minX = first.x
            let minY = first.y
            let maxX = first.x
            let maxY = first.y
            shape.points.forEach((point) => {
                minX = Math.min(minX, point.x)
                minY = Math.min(minY, point.y)
                maxX = Math.max(maxX, point.x)
                maxY = Math.max(maxY, point.y)
            })
            return { minX, minY, maxX, maxY }
        }
        if (shape.type === "text") {
            const width = Math.max(shape.text.length * shape.fontSize * 0.6, shape.fontSize * 0.5)
            return {
                minX: shape.x,
                minY: shape.y,
                maxX: shape.x + width,
                maxY: shape.y + shape.fontSize,
            }
        }
        return null
    }

    private resizeCursor(handle: ResizeHandle) {
        if (handle === "nw" || handle === "se") {
            return "nwse-resize"
        }
        return "nesw-resize"
    }

    private getResizeHandlePoints(bounds: ShapeBounds): Record<ResizeHandle, { x: number; y: number }> {
        return {
            nw: { x: bounds.minX, y: bounds.minY },
            ne: { x: bounds.maxX, y: bounds.minY },
            sw: { x: bounds.minX, y: bounds.maxY },
            se: { x: bounds.maxX, y: bounds.maxY },
        }
    }

    private detectResizeHandle(bounds: ShapeBounds, x: number, y: number): ResizeHandle | null {
        const points = this.getResizeHandlePoints(bounds)
        const hitRadius = 9 / this.scale
        const handles: ResizeHandle[] = ["nw", "ne", "sw", "se"]
        for (const handle of handles) {
            const point = points[handle]
            if (!point) continue
            if (Math.abs(x - point.x) <= hitRadius && Math.abs(y - point.y) <= hitRadius) {
                return handle
            }
        }
        return null
    }

    private drawResizeHandles(bounds: ShapeBounds, activeHandle: ResizeHandle | null) {
        const points = this.getResizeHandlePoints(bounds)
        const size = 10 / this.scale
        const handles: ResizeHandle[] = ["nw", "ne", "sw", "se"]
        handles.forEach((handle) => {
            const point = points[handle]
            if (!point) return
            const isActive = activeHandle === handle
            this.ctx.fillStyle = isActive ? "rgba(99, 172, 255, 1)" : "rgba(18, 18, 18, 0.95)"
            this.ctx.strokeStyle = "rgba(99, 172, 255, 0.95)"
            this.ctx.lineWidth = 1.2 / this.scale
            this.ctx.beginPath()
            this.ctx.rect(point.x - size / 2, point.y - size / 2, size, size)
            this.ctx.fill()
            this.ctx.stroke()
        })
    }

    private getOppositeCorner(bounds: ShapeBounds, handle: ResizeHandle) {
        if (handle === "nw") return { x: bounds.maxX, y: bounds.maxY }
        if (handle === "ne") return { x: bounds.minX, y: bounds.maxY }
        if (handle === "sw") return { x: bounds.maxX, y: bounds.minY }
        return { x: bounds.minX, y: bounds.minY }
    }

    private buildBoundsFromAnchor(anchor: { x: number; y: number }, x: number, y: number): ShapeBounds {
        const minSize = 12 / this.scale
        let minX = Math.min(anchor.x, x)
        let maxX = Math.max(anchor.x, x)
        let minY = Math.min(anchor.y, y)
        let maxY = Math.max(anchor.y, y)

        if (maxX - minX < minSize) {
            if (x >= anchor.x) maxX = anchor.x + minSize
            else minX = anchor.x - minSize
        }
        if (maxY - minY < minSize) {
            if (y >= anchor.y) maxY = anchor.y + minSize
            else minY = anchor.y - minSize
        }

        return { minX, minY, maxX, maxY }
    }

    private cloneShape(shape: Shape): Shape {
        return JSON.parse(JSON.stringify(shape)) as Shape
    }

    private resizeShapeToBounds(shape: Shape, originalBounds: ShapeBounds, nextBounds: ShapeBounds): Shape {
        const oldWidth = Math.max(originalBounds.maxX - originalBounds.minX, 1e-6)
        const oldHeight = Math.max(originalBounds.maxY - originalBounds.minY, 1e-6)
        const newWidth = Math.max(nextBounds.maxX - nextBounds.minX, 1e-6)
        const newHeight = Math.max(nextBounds.maxY - nextBounds.minY, 1e-6)
        const scaleX = newWidth / oldWidth
        const scaleY = newHeight / oldHeight

        const mapPoint = (x: number, y: number) => ({
            x: nextBounds.minX + ((x - originalBounds.minX) / oldWidth) * newWidth,
            y: nextBounds.minY + ((y - originalBounds.minY) / oldHeight) * newHeight,
        })

        if (shape.type === "rect" || shape.type === "diamond" || shape.type === "triangle") {
            return {
                ...shape,
                x: nextBounds.minX,
                y: nextBounds.minY,
                width: nextBounds.maxX - nextBounds.minX,
                height: nextBounds.maxY - nextBounds.minY,
            }
        }

        if (shape.type === "ellipse") {
            return {
                ...shape,
                centerX: (nextBounds.minX + nextBounds.maxX) / 2,
                centerY: (nextBounds.minY + nextBounds.maxY) / 2,
                radX: (nextBounds.maxX - nextBounds.minX) / 2,
                radY: (nextBounds.maxY - nextBounds.minY) / 2,
            }
        }

        if (shape.type === "line" || shape.type === "arrow") {
            const from = mapPoint(shape.fromX, shape.fromY)
            const to = mapPoint(shape.toX, shape.toY)
            return {
                ...shape,
                fromX: from.x,
                fromY: from.y,
                toX: to.x,
                toY: to.y,
            }
        }

        if (shape.type === "pencil") {
            return {
                ...shape,
                points: shape.points.map((point) => mapPoint(point.x, point.y)),
            }
        }

        if (shape.type === "text") {
            const topLeft = mapPoint(shape.x, shape.y)
            const scaledSize = Math.max(12, Math.round(shape.fontSize * Math.min(scaleX, scaleY)))
            return {
                ...shape,
                x: topLeft.x,
                y: topLeft.y,
                fontSize: scaledSize,
            }
        }

        return shape
    }

    drawRect(x:number , y:number , width: number, height: number, strokeWidth: number, strokeFill: string, bgFill: string, opacity: number = 1, strokeStyle: StrokeStyle = "solid"){
        // If we draw right to left, width is -ve and so postion of mouse + (-ve width) gives top left corner
        const posX = width < 0 ? x + width : x;
        const posY = height < 0 ? y + height : y;
        const normalizedWidth = Math.abs(width);
        const normalizedHeight = Math.abs(height);

        strokeWidth = strokeWidth || 1;
        strokeFill = strokeFill || "rgba(255, 255, 255)";
        bgFill = bgFill || "rgba(18, 18, 18)";
    
        const radius = Math.min(Math.abs(Math.max(normalizedWidth, normalizedHeight) / 20), normalizedWidth / 2, normalizedHeight / 2);
    
        const previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = opacity;
        this.applyStrokeStyle(strokeStyle);

        // RoundRect : https://stackoverflow.com/a/3368118
        this.ctx.beginPath();
        this.ctx.moveTo(posX + radius, posY);
        this.ctx.strokeStyle = strokeFill;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.fillStyle = bgFill;
        this.ctx.lineTo(posX + normalizedWidth - radius, posY);
        this.ctx.quadraticCurveTo(posX + normalizedWidth, posY, posX + normalizedWidth, posY + radius);
        this.ctx.lineTo(posX + normalizedWidth, posY + normalizedHeight - radius);
        this.ctx.quadraticCurveTo(posX + normalizedWidth, posY + normalizedHeight, posX + normalizedWidth - radius, posY + normalizedHeight);
        this.ctx.lineTo(posX + radius, posY + normalizedHeight);
        this.ctx.quadraticCurveTo(posX, posY + normalizedHeight, posX, posY + normalizedHeight - radius);
        this.ctx.lineTo(posX, posY + radius);
        this.ctx.quadraticCurveTo(posX, posY, posX + radius, posY);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.globalAlpha = previousAlpha;
        this.ctx.setLineDash([]);
    }

    drawEllipse(x: number, y:number, width: number , height: number, strokeWidth: number, strokeFill: string, bgFill: string, opacity: number = 1, strokeStyle: StrokeStyle = "solid"){
        strokeWidth = strokeWidth || 1;
        strokeFill = strokeFill || "rgba(255, 255, 255)";    
        bgFill = bgFill || "rgba(18, 18, 18)";

        const previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = opacity;
        this.applyStrokeStyle(strokeStyle);

        this.ctx.beginPath()
        this.ctx.strokeStyle = strokeFill;
        this.ctx.lineWidth = strokeWidth;   
        this.ctx.fillStyle = bgFill;
        this.ctx.ellipse(x, y, width, height, 0 , 0  , 2* Math.PI)
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.globalAlpha = previousAlpha;
        this.ctx.setLineDash([]);
    }

    drawLine(fromX:number, fromY:number , toX:number, toY:number ,  strokeWidth: number, strokeFill: string, opacity: number = 1, strokeStyle: StrokeStyle = "solid"){
        strokeWidth = strokeWidth || 1;
        strokeFill = strokeFill || "rgba(255, 255, 255)";

        const previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = opacity;
        this.applyStrokeStyle(strokeStyle);

        this.ctx.beginPath()
        this.ctx.strokeStyle = strokeFill;
        this.ctx.lineWidth = strokeWidth;    

        this.ctx.moveTo(fromX, fromY)
        this.ctx.lineTo(toX, toY)
        this.ctx.stroke()

        this.ctx.globalAlpha = previousAlpha;
        this.ctx.setLineDash([]);
    }

    drawPencil(points: {x:number, y:number}[], strokeWidth: number, strokeFill: string, opacity: number = 1, strokeStyle: StrokeStyle = "solid"){
        const previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = opacity;
        this.applyStrokeStyle(strokeStyle);

        this.ctx.beginPath()
        this.ctx.strokeStyle = strokeFill;
        this.ctx.lineWidth = strokeWidth;
        if(points[0] === undefined) return null;
        this.ctx.moveTo(points[0].x , points[0].y)
        points.forEach(point => this.ctx.lineTo(point.x, point.y))
        this.ctx.stroke()

        this.ctx.globalAlpha = previousAlpha;
        this.ctx.setLineDash([]);
    }

    drawArrow(fromX: number, fromY: number, toX: number, toY: number, strokeWidth: number, strokeFill: string, opacity: number = 1, strokeStyle: StrokeStyle = "solid") {
        const previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = opacity;
        this.applyStrokeStyle(strokeStyle);

        // Draw the line
        this.ctx.beginPath();
        this.ctx.strokeStyle = strokeFill;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;

        this.ctx.setLineDash([]); // Arrowhead is always solid
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - arrowLength * Math.cos(angle - arrowAngle),
            toY - arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - arrowLength * Math.cos(angle + arrowAngle),
            toY - arrowLength * Math.sin(angle + arrowAngle)
        );
        this.ctx.stroke();

        this.ctx.globalAlpha = previousAlpha;
        this.ctx.setLineDash([]);
    }

    drawDiamond(x: number, y: number, width: number, height: number, strokeWidth: number, strokeFill: string, bgFill: string, opacity: number = 1, strokeStyle: StrokeStyle = "solid") {
        const posX = width < 0 ? x + width : x;
        const posY = height < 0 ? y + height : y;
        const normalizedWidth = Math.abs(width);
        const normalizedHeight = Math.abs(height);

        strokeWidth = strokeWidth || 1;
        strokeFill = strokeFill || "rgba(255, 255, 255)";
        bgFill = bgFill || "rgba(18, 18, 18)";

        const previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = opacity;
        this.applyStrokeStyle(strokeStyle);

        // Diamond shape
        const centerX = posX + normalizedWidth / 2;
        const centerY = posY + normalizedHeight / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(centerX, posY); // Top
        this.ctx.lineTo(posX + normalizedWidth, centerY); // Right
        this.ctx.lineTo(centerX, posY + normalizedHeight); // Bottom
        this.ctx.lineTo(posX, centerY); // Left
        this.ctx.closePath();

        this.ctx.strokeStyle = strokeFill;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.fillStyle = bgFill;
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.globalAlpha = previousAlpha;
        this.ctx.setLineDash([]);
    }

    drawTriangle(x: number, y: number, width: number, height: number, strokeWidth: number, strokeFill: string, bgFill: string, opacity: number = 1, strokeStyle: StrokeStyle = "solid") {
        const posX = width < 0 ? x + width : x;
        const posY = height < 0 ? y + height : y;
        const normalizedWidth = Math.abs(width);
        const normalizedHeight = Math.abs(height);

        strokeWidth = strokeWidth || 1;
        strokeFill = strokeFill || "rgba(255, 255, 255)";
        bgFill = bgFill || "rgba(18, 18, 18)";

        const previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = opacity;
        this.applyStrokeStyle(strokeStyle);

        // Triangle shape
        const centerX = posX + normalizedWidth / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(centerX, posY); // Top center
        this.ctx.lineTo(posX + normalizedWidth, posY + normalizedHeight); // Bottom right
        this.ctx.lineTo(posX, posY + normalizedHeight); // Bottom left
        this.ctx.closePath();

        this.ctx.strokeStyle = strokeFill;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.fillStyle = bgFill;
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.globalAlpha = previousAlpha;
        this.ctx.setLineDash([]);
    }

    drawText(x: number, y: number, text: string, fontSize: number, strokeFill: string, opacity: number = 1) {
        const previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = opacity;

        this.ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
        this.ctx.fillStyle = strokeFill;
        this.ctx.textBaseline = "top";
        this.ctx.fillText(text, x, y);

        this.ctx.globalAlpha = previousAlpha;
    }

    erase(x: number , y:number){
        const transformedPoint = this.transformPanScale(x, y);

        const shapeIndex = this.existingShape.findIndex((shape) =>
            this.isPointInShape(transformedPoint.x, transformedPoint.y, shape)
        );
    
        if (shapeIndex !== -1) {
            const erasedShape = this.existingShape[shapeIndex]
            this.existingShape.splice(shapeIndex, 1);
            this.clearCanvas(); 
            
            this.socket.send(JSON.stringify({
                type: "erase",
                data: JSON.stringify({
                    shape: erasedShape
                }),
                roomId : this.roomId 
            }))
            
        }

    }

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked= false
        this.updateCursor()

        if (this.isResizing && this.selectedShapeIndex !== null) {
            this.isResizing = false
            this.activeResizeHandle = null
            this.resizeAnchor = null
            this.resizeOriginalBounds = null
            this.resizeOriginalShape = null
            this.saveToHistory()
            const shape = this.existingShape[this.selectedShapeIndex]
            if (shape) {
                this.socket.send(JSON.stringify({
                    type: "update",
                    data: JSON.stringify({ shape, index: this.selectedShapeIndex }),
                    roomId: this.roomId
                }))
            }
            this.updateCursor()
            this.clearCanvas()
            return
        }

        // Handle drag completion
        if (this.isDragging && this.selectedShapeIndex !== null) {
            this.isDragging = false
            this.updateCursor()
            this.saveToHistory()
            // Sync dragged shape position with server
            const shape = this.existingShape[this.selectedShapeIndex]
            if (shape) {
                this.socket.send(JSON.stringify({
                    type: "update",
                    data: JSON.stringify({ shape, index: this.selectedShapeIndex }),
                    roomId: this.roomId
                }))
            }
            return
        }

        const { x, y } = this.transformPanScale(e.clientX, e.clientY);
        const width = x - this.startX;
        const height = y - this.startY;

        let shape : Shape | null = null
        if(this.activeTool === "rect"){
            shape  = {
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
            } 
        } else if(this.activeTool === "ellipse"){

            const centerX = this.startX + width / 2;
            const centerY = this.startY + height / 2;
            const radX = Math.abs(width / 2);
            const radY = Math.abs(height / 2);

            shape = {
                type: "ellipse",
                centerX,
                centerY,
                radX,
                radY,
                strokeWidth: this.strokeWidth,
                strokeFill: this.strokeFill,
                bgFill: this.bgFill,
                opacity: this.opacity,
                strokeStyle: this.strokeStyle,
            }
        } else if (this.activeTool === "line"){
            shape = {
                type: "line",
                fromX: this.startX,
                fromY: this.startY,
                toX: x,
                toY: y,
                strokeWidth: this.strokeWidth,
                strokeFill: this.strokeFill,
                opacity: this.opacity,
                strokeStyle: this.strokeStyle,
            }
        } else if (this.activeTool === "arrow"){
            shape = {
                type: "arrow",
                fromX: this.startX,
                fromY: this.startY,
                toX: x,
                toY: y,
                strokeWidth: this.strokeWidth,
                strokeFill: this.strokeFill,
                opacity: this.opacity,
                strokeStyle: this.strokeStyle,
            }
        } else if (this.activeTool === "diamond"){
            shape = {
                type: "diamond",
                x: this.startX,
                y: this.startY,
                width,
                height,
                strokeWidth: this.strokeWidth,
                strokeFill: this.strokeFill,
                bgFill: this.bgFill,
                opacity: this.opacity,
                strokeStyle: this.strokeStyle,
            }
        } else if (this.activeTool === "triangle"){
            shape = {
                type: "triangle",
                x: this.startX,
                y: this.startY,
                width,
                height,
                strokeWidth: this.strokeWidth,
                strokeFill: this.strokeFill,
                bgFill: this.bgFill,
                opacity: this.opacity,
                strokeStyle: this.strokeStyle,
            }
        } else if (this.activeTool === "pencil"){
            const currentShape = this.existingShape[this.existingShape.length - 1]
            if(currentShape?.type === "pencil"){
                shape={
                    type: "pencil",
                    points: currentShape.points,
                    strokeWidth: this.strokeWidth,
                    strokeFill: this.strokeFill,
                    opacity: this.opacity,
                    strokeStyle: this.strokeStyle,
                }
            }
            
        } else if (this.activeTool === "grab"){
            this.startX = e.clientX 
            this.startY = e.clientY 
        } else if (this.activeTool === "text") {
            // Prompt for text input
            const text = prompt("Enter text:")
            if (text && text.trim()) {
                shape = {
                    type: "text",
                    x: this.startX,
                    y: this.startY,
                    text: text.trim(),
                    fontSize: this.fontSize,
                    strokeFill: this.strokeFill,
                    opacity: this.opacity,
                }
            }
        }
         

        if(!shape){
            this.updateCursor()
            return ;
        }

        this.existingShape.push(shape)
        this.updateCursor()
        this.saveToHistory()

        this.socket.send(JSON.stringify({
            type: "draw",
            data: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
    }



    private getCanvasOffset(clientX: number, clientY: number) {
        const rect = this.canvas.getBoundingClientRect()
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    private getTouchDistance(a: Touch, b: Touch) {
        return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
    }

    private handlePinch(touchA: Touch, touchB: Touch) {
        const distance = this.getTouchDistance(touchA, touchB)
        if (!this.pinchDistance) {
            this.pinchDistance = distance
            return
        }

        const prevScale = this.scale
        const ratio = distance / this.pinchDistance
        const unclamped = prevScale * ratio
        const newScale = Math.min(this.maxScale, Math.max(this.minScale, unclamped))

        const centerX = (touchA.clientX + touchB.clientX) / 2
        const centerY = (touchA.clientY + touchB.clientY) / 2
        const { x: canvasX, y: canvasY } = this.getCanvasOffset(centerX, centerY)

        const canvasMouseX = (canvasX - this.panX) / prevScale
        const canvasMouseY = (canvasY - this.panY) / prevScale

        this.panX -= canvasMouseX * (newScale - prevScale)
        this.panY -= canvasMouseY * (newScale - prevScale)

        this.scale = newScale
        this.onScaleChange(this.scale)
        this.clearCanvas()

        this.pinchDistance = distance
    }

    touchStartHandler = (event: TouchEvent) => {
        event.preventDefault()
        if (event.touches.length >= 2) {
            this.isPinching = true
            const touchA = event.touches.item(0)
            const touchB = event.touches.item(1)
            if (touchA && touchB) {
                this.pinchDistance = this.getTouchDistance(touchA, touchB)
            }
            return
        }
        const touch = event.touches[0]
        if (touch) {
            this.touchPointerId = touch.identifier
            this.mouseDownHandler({
                clientX: touch.clientX,
                clientY: touch.clientY,
            } as MouseEvent)
            this.queueCursor(touch.clientX, touch.clientY)
        }
    }

    touchMoveHandler = (event: TouchEvent) => {
        event.preventDefault()
        if (this.isPinching && event.touches.length >= 2) {
            const touchA = event.touches.item(0)
            const touchB = event.touches.item(1)
            if (touchA && touchB) {
                this.handlePinch(touchA, touchB)
            }
            return
        }
        if (this.touchPointerId === null) {
            return
        }
        const touch = Array.from(event.touches).find(
            (t) => t.identifier === this.touchPointerId
        )
        if (touch) {
            this.mouseMoveHandler({
                clientX: touch.clientX,
                clientY: touch.clientY,
            } as MouseEvent)
            this.queueCursor(touch.clientX, touch.clientY)
        }
    }

    touchEndHandler = (event: TouchEvent) => {
        event.preventDefault()
        if (event.touches.length < 2) {
            this.isPinching = false
            this.pinchDistance = 0
        }
        const touch = Array.from(event.changedTouches).find(
            (t) => t.identifier === this.touchPointerId
        )
        if (touch) {
            this.mouseUpHandler({
                clientX: touch.clientX,
                clientY: touch.clientY,
            } as MouseEvent)
        }
        if (event.touches.length === 0) {
            this.touchPointerId = null
        }
    }

    touchCancelHandler = (event: TouchEvent) => {
        event.preventDefault()
        this.isPinching = false
        this.pinchDistance = 0
        this.touchPointerId = null
        this.mouseUpHandler({
            clientX: event.changedTouches[0]?.clientX || 0,
            clientY: event.changedTouches[0]?.clientY || 0,
        } as MouseEvent)
    }


    mouseWheelHandler = (e : WheelEvent) => {
        e.preventDefault();

        const scaleAmount = -e.deltaY / 200;
        const unclamped = this.scale * (1 + scaleAmount);
        const newScale = Math.min(this.maxScale, Math.max(this.minScale, unclamped));

        const mouseX = e.clientX - this.canvas.offsetLeft;
        const mouseY = e.clientY - this.canvas.offsetTop;
        // Position of cursor on canvas
        const canvasMouseX = (mouseX - this.panX) / this.scale;
        const canvasMouseY = (mouseY - this.panY) / this.scale;

        this.panX -= (canvasMouseX * (newScale - this.scale));
        this.panY -= (canvasMouseY * (newScale - this.scale));

        this.scale = newScale;
        
        this.onScaleChange(this.scale)
        this.clearCanvas();
        
    };


    exportPNG() {
        const fileName = this.bestName("png")
        this.triggerDownload(this.canvas.toDataURL("image/png"), fileName)
    }

    exportSVG() {
        const svg = this.buildSVG()
        const blob = new Blob([svg], { type: "image/svg+xml" })
        this.downloadBlob(blob, this.bestName("svg"))
    }

    exportJSON() {
        const payload = {
            roomName: this.room?.roomName || this.roomId,
            exportedAt: Date.now(),
            shapes: this.existingShape,
        }
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
        this.downloadBlob(blob, this.bestName("json"))
    }

    async importJSON(file: File) {
        const text = await file.text()
        let parsed: unknown
        try {
            parsed = JSON.parse(text)
        } catch (error) {
            throw new Error("Invalid JSON")
        }
        if (!this.isImportPayload(parsed)) {
            throw new Error("JSON must include a shapes array")
        }

        this.existingShape = [...parsed.shapes]
        this.clearCanvas()
        this.saveToHistory()
        this.persistSnapshot()

        this.socket.send(JSON.stringify({
            type: "reset",
            roomId: this.roomId
        }))
        this.socket.send(JSON.stringify({
            type: "bulk_draw",
            roomId: this.roomId,
            shapes: parsed.shapes
        }))
    }

    private isImportPayload(value: unknown): value is { shapes: Shape[] } {
        if (!value || typeof value !== "object") {
            return false
        }
        const payload = value as { shapes?: unknown }
        return Array.isArray(payload.shapes)
    }

    private buildSVG() {
        const width = this.canvas.width
        const height = this.canvas.height
        const body = this.existingShape
            .map((shape) => this.shapeToSVG(shape))
            .filter(Boolean)
            .join("")

        return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`
    }

    private shapeToSVG(shape: Shape): string | null {
        const strokeDash = shape.type === "text" ? "" : this.svgStrokeDash(shape.strokeStyle)
        switch (shape.type) {
            case "rect": {
                const width = shape.width
                const height = shape.height
                const x = width < 0 ? shape.x + width : shape.x
                const y = height < 0 ? shape.y + height : shape.y
                return `<rect x="${x}" y="${y}" width="${Math.abs(width)}" height="${Math.abs(height)}" fill="${shape.bgFill}" stroke="${shape.strokeFill}" stroke-width="${shape.strokeWidth}" stroke-dasharray="${strokeDash}" opacity="${shape.opacity}" />`
            }
            case "ellipse": {
                return `<ellipse cx="${shape.centerX}" cy="${shape.centerY}" rx="${shape.radX}" ry="${shape.radY}" fill="${shape.bgFill}" stroke="${shape.strokeFill}" stroke-width="${shape.strokeWidth}" stroke-dasharray="${strokeDash}" opacity="${shape.opacity}" />`
            }
            case "line":
            case "arrow": {
                return `<line x1="${shape.fromX}" y1="${shape.fromY}" x2="${shape.toX}" y2="${shape.toY}" stroke="${shape.strokeFill}" stroke-width="${shape.strokeWidth}" stroke-dasharray="${strokeDash}" opacity="${shape.opacity}" stroke-linecap="round" />`
            }
            case "diamond": {
                const cx = shape.x + shape.width / 2
                const cy = shape.y + shape.height / 2
                const points = [
                    `${cx},${shape.y}`,
                    `${shape.x + shape.width},${cy}`,
                    `${cx},${shape.y + shape.height}`,
                    `${shape.x},${cy}`,
                ].join(" ")
                return `<polygon points="${points}" fill="${shape.bgFill}" stroke="${shape.strokeFill}" stroke-width="${shape.strokeWidth}" stroke-dasharray="${strokeDash}" opacity="${shape.opacity}" />`
            }
            case "triangle": {
                const points = [
                    `${shape.x + shape.width / 2},${shape.y}`,
                    `${shape.x + shape.width},${shape.y + shape.height}`,
                    `${shape.x},${shape.y + shape.height}`,
                ].join(" ")
                return `<polygon points="${points}" fill="${shape.bgFill}" stroke="${shape.strokeFill}" stroke-width="${shape.strokeWidth}" stroke-dasharray="${strokeDash}" opacity="${shape.opacity}" />`
            }
            case "pencil": {
                const d = shape.points
                    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
                    .join(" ")
                return `<path d="${d}" fill="none" stroke="${shape.strokeFill}" stroke-width="${shape.strokeWidth}" stroke-dasharray="${strokeDash}" opacity="${shape.opacity}" stroke-linecap="round" stroke-linejoin="round" />`
            }
            case "text": {
                return `<text x="${shape.x}" y="${shape.y}" font-family="Inter, Arial, sans-serif" font-size="${shape.fontSize}" fill="${shape.strokeFill}" opacity="${shape.opacity}">${this.escapeSvgText(shape.text)}</text>`
            }
            default:
                return null
        }
    }

    private escapeSvgText(value: string) {
        return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }

    private svgStrokeDash(style: StrokeStyle) {
        if (style === "dashed") return "6,4"
        if (style === "dotted") return "2,4"
        return ""
    }

    private bestName(ext: string) {
        const base = (this.room?.roomName || this.roomId).replace(/\s+/g, "-").toLowerCase()
        return `${base}-${Date.now()}.${ext}`
    }

    private triggerDownload(source: string, filename: string) {
        const link = document.createElement("a")
        link.href = source
        link.download = filename
        link.click()
    }

    private downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob)
        this.triggerDownload(url, filename)
        window.setTimeout(() => {
            URL.revokeObjectURL(url)
        }, 1500)
    }


    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
        this.canvas.removeEventListener("wheel" , this.mouseWheelHandler)
        this.canvas.removeEventListener("touchstart", this.touchStartHandler)
        this.canvas.removeEventListener("touchmove", this.touchMoveHandler)
        this.canvas.removeEventListener("touchend", this.touchEndHandler)
        this.canvas.removeEventListener("touchcancel", this.touchCancelHandler)
        if (this.snapshotIntervalId) {
            window.clearInterval(this.snapshotIntervalId)
        }
    }



    onScaleChange(scale: number) {
        this.outputScale = scale;
        if (this.onScaleChangeCallback) {
            this.onScaleChangeCallback(scale);
        }
    }

    private snapshotKey(): string {
        return `drawr:snapshot:${this.roomId}`
    }

    private loadSnapshot(): Shape[] | null {
        try {
            const raw = localStorage.getItem(this.snapshotKey())
            if (!raw) return null
            const data = JSON.parse(raw)
            if (Array.isArray(data?.shapes)) {
                return data.shapes as Shape[]
            }
        } catch (e) {
            return null
        }
        return null
    }

    private persistSnapshot() {
        try {
            const now = Date.now()
            if (now - this.lastSnapshotAt < 2000) {
                return
            }
            this.lastSnapshotAt = now
            localStorage.setItem(this.snapshotKey(), JSON.stringify({
                shapes: this.existingShape,
                updatedAt: now
            }))
        } catch (e) {
            // ignore storage failures
        }
    }



}
