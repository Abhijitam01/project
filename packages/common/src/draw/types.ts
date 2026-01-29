
export type Tool = 
    | "rect" 
    | "ellipse" 
    | "grab" 
    | "line" 
    | "pencil" 
    | "erase" 
    | "circle" 
    | "arrow" 
    | "text" 
    | "eraser";

export type strokeWidth = 1 | 2 | 4;

export type strokeFill = 
    | "rgba(255, 255, 255)" // Fallback/Default?
    | "rgba(211, 211, 211)" 
    | "rgba(242, 154, 158)" 
    | "rgba(77, 161, 83)" 
    | "rgba(98, 177, 247)" 
    | "rgba(183, 98, 42)";

export type bgFill = 
    | "rgba(18, 18, 18)" // Fallback/Default?
    | "rgba(0, 0, 0, 0)" 
    | "rgba(89, 49, 49)" 
    | "rgba(23, 61, 16)" 
    | "rgba(30, 70, 101)" 
    | "rgba(49, 37, 7)";

export type CanvasShape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    points: { x: number; y: number }[];
} | {
    type: "arrow";
    x: number;
    y: number;
    endX: number;
    endY: number;
} | {
    type: "text";
    x: number;
    y: number;
    text: string;
} | {
    // Add types from render/Game.ts
    type: "ellipse";
    centerX: number;
    centerY: number;
    radX: number;
    radY: number;
} | {
    type: "line";
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
};
