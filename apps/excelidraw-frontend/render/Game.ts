import { getRoom } from "@/actions/getRoom"
import { Tool } from "@/canvas/Canvas";
import rough from 'roughjs';

type StrokeStyle = "solid" | "dashed" | "dotted";

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

export class Game {

    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private rc: any // RoughCanvas instance
    private roomId: string
    private socket: WebSocket
    private existingShape: Shape[]
    private clicked: boolean
    private room: any
    private activeTool: Tool = "grab"
    private startX: number = 0
    private startY: number = 0
    private panX: number = 0
    private panY: number = 0
    private scale: number = 1
    private onScaleChangeCallback: (scale: number) => void;
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
    private  isDragging: boolean = false
    private  dragOffsetX: number = 0
    private  dragOffsetY: number = 0
    
    constructor(
        canvas: HTMLCanvasElement , 
        roomId: string , 
        socket: WebSocket, 
        room: any,  
        onScaleChangeCallback: (scale: number) => void
){
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")!
        this.rc = rough.canvas(canvas)
        this.roomId = roomId
        this.socket = socket
        this.clicked = false
        this.existingShape = []
        this.canvas.width = document.body.clientWidth
        this.canvas.height = document.body.clientHeight
        this.onScaleChangeCallback = onScaleChangeCallback;
        this.room = room
        this.init()
        this.initHandler()
        this.initMouseHandler()
        


    }

       async init()  {
        const room = await getRoom(this.room.roomName)
        room.shape.map((shape: any)=>{
            const shapes = JSON.parse(shape.data)
            this.existingShape.push(shapes.shape)
        })
        console.log(this.existingShape)
        this.clearCanvas()
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

        }
    }



    initMouseHandler(){
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)
        this.canvas.addEventListener("mouseup", this.mouseUpHandler)
        this.canvas.addEventListener("wheel", this.mouseWheelHandler)
    }

    setTool(tool : Tool){
        this.activeTool = tool
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
            // Adjusts the offset of the canvas
            -this.panX / this.scale, 
            -this.panY / this.scale, 
            // Adjusts the scale of the canvas
            this.canvas.width/ this.scale, 
            this.canvas.height / this.scale);

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

       
    
    }

    mouseDownHandler = (e : MouseEvent) => {
        this.clicked = true

        const { x, y } = this.transformPanScale(e.clientX, e.clientY);

        this.startX = x
        this.startY = y

        // Handle selection and dragging with select tool
        if (this.activeTool === "select") {
            // Find shape under cursor (search from top to bottom)
            for (let i = this.existingShape.length - 1; i >= 0; i--) {
                const shape = this.existingShape[i]
                if (shape && this.isPointInShape(x, y, shape)) {
                    this.selectedShapeIndex = i
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
                    this.clearCanvas()
                    return
                }
            }
            // Clicked on empty space - deselect
            this.selectedShapeIndex = null
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
        if(this.clicked){

            const {x ,y} = this.transformPanScale(e.clientX , e.clientY)

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

            const width = x - this.startX
            const height = y - this.startY
    
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
                this.drawLine(this.startX, this.startY, x, y, this.strokeWidth, this.strokeFill, this.opacity, this.strokeStyle)
            } else if(activeTool === "arrow"){
                this.drawArrow(this.startX, this.startY, x, y, this.strokeWidth, this.strokeFill, this.opacity, this.strokeStyle)
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
        } else if (shape.type === "line") {
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
        } else if (shape.type === "pencil") {
            return shape.points.some(
                (point) => Math.hypot(point.x - x, point.y - y) <= tolerance
            );
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

        // Handle drag completion
        if (this.isDragging && this.selectedShapeIndex !== null) {
            this.isDragging = false
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
            return ;
        }

        this.existingShape.push(shape)
        this.saveToHistory()

        this.socket.send(JSON.stringify({
            type: "draw",
            data: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
    }



    mouseWheelHandler = (e : WheelEvent) => {
        e.preventDefault();

        const scaleAmount = -e.deltaY / 200;
        const newScale = this.scale * (1 + scaleAmount); 

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


    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
        this.canvas.removeEventListener("wheel" , this.mouseWheelHandler)
    }



    onScaleChange(scale: number) {
        this.outputScale = scale;
        if (this.onScaleChangeCallback) {
            this.onScaleChangeCallback(scale);
        }
    }




}