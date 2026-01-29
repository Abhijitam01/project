
import { Tool, CanvasShape } from "./types";
import { getExistingCanvasShapes } from "./http";

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingCanvasShapes: CanvasShape[]
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "pencil";
    private currentPencilPoints: { x: number; y: number }[] = [];

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingCanvasShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }
    
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    async init() {
        this.existingCanvasShapes = await getExistingCanvasShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type == "chat") {
                const parsedCanvasShape = JSON.parse(message.message)
                this.existingCanvasShapes.push(parsedCanvasShape.shape)
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingCanvasShapes.forEach((shape) => {
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
            this.ctx.lineWidth = 2;
            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            } else if (shape.type === "pencil") {
                if (shape.points.length < 2) return;
                this.ctx.beginPath();
                this.ctx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
                for (let i = 1; i < shape.points.length; i++) {
                    this.ctx.lineTo(shape.points[i]!.x, shape.points[i]!.y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "arrow") {
                this.drawArrow(shape.x, shape.y, shape.endX, shape.endY);
            } else if (shape.type === "text") {
                this.ctx.font = "20px Inter, sans-serif";
                this.ctx.fillStyle = "white";
                this.ctx.fillText(shape.text, shape.x, shape.y);
            }
        })
    }

    private drawArrow(fromx: number, fromy: number, tox: number, toy: number) {
        const headlen = 10;
        const dx = tox - fromx;
        const dy = toy - fromy;
        const angle = Math.atan2(dy, dx);
        this.ctx.beginPath();
        this.ctx.moveTo(fromx, fromy);
        this.ctx.lineTo(tox, toy);
        this.ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(tox, toy);
        this.ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.stroke();
        this.ctx.closePath();
    }

    exportCanvas() {
        this.clearCanvas();
        const dataURL = this.canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `canvas-${this.roomId}-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY
        if (this.selectedTool === "pencil") {
            this.currentPencilPoints = [{ x: e.clientX, y: e.clientY }];
        }
    }

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;
        const selectedTool = this.selectedTool;
        let shape: CanvasShape | null = null;
        if (selectedTool === "rect") {
            shape = { type: "rect", x: this.startX, y: this.startY, height, width }
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = { type: "circle", radius, centerX: this.startX + radius, centerY: this.startY + radius }
        } else if (selectedTool === "pencil") {
            shape = { type: "pencil", points: this.currentPencilPoints }
            this.currentPencilPoints = [];
        } else if (selectedTool === "arrow") {
            shape = { type: "arrow", x: this.startX, y: this.startY, endX: e.clientX, endY: e.clientY }
        } else if (selectedTool === "text") {
            const text = prompt("Enter text:") || "";
            if (text) {
                shape = { type: "text", x: e.clientX, y: e.clientY, text }
            }
        }
        if (!shape) return;
        this.existingCanvasShapes.push(shape);
        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId
        }))
    }

    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
            const selectedTool = this.selectedTool;
            if (selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);   
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                const centerX = this.startX + radius;
                const centerY = this.startY + radius;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            } else if (selectedTool === "pencil") {
                this.currentPencilPoints.push({ x: e.clientX, y: e.clientY });
                this.ctx.beginPath();
                if (this.currentPencilPoints.length > 0) {
                    this.ctx.moveTo(this.currentPencilPoints[0]!.x, this.currentPencilPoints[0]!.y);
                    for (let i = 1; i < this.currentPencilPoints.length; i++) {
                        this.ctx.lineTo(this.currentPencilPoints[i]!.x, this.currentPencilPoints[i]!.y);
                    }
                    this.ctx.stroke();
                }
                this.ctx.closePath();
            } else if (selectedTool === "arrow") {
                this.drawArrow(this.startX, this.startY, e.clientX, e.clientY);
            }
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)
        this.canvas.addEventListener("mouseup", this.mouseUpHandler)
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)    
    }
}
