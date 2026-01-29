import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Game } from "@/draw/Game";
import { MainSidebar } from "./MainSidebar";
import { PropertiesSidebar } from "./PropertiesSidebar";

export type Tool = "circle" | "rect" | "pencil" | "arrow" | "text" | "eraser";

export function Canvas({
    roomId,
    socket
}: {
    socket: WebSocket;
    roomId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
    const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            const handleResize = () => {
                if (canvasRef.current) {
                    canvasRef.current.width = window.innerWidth;
                    canvasRef.current.height = window.innerHeight;
                    g.clearCanvas();
                }
            };

            window.addEventListener("resize", handleResize);

            return () => {
                g.destroy();
                window.removeEventListener("resize", handleResize);
            }
        }
    }, [canvasRef, roomId, socket]);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-zinc-950">
            <canvas 
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight}
                className="cursor-crosshair"
            />
            
            <MainSidebar 
                selectedTool={selectedTool} 
                setSelectedTool={setSelectedTool}
                onExport={() => game?.exportCanvas()}
            />

            <PropertiesSidebar 
                selectedTool={selectedTool}
                isOpen={isPropertiesOpen}
                setIsOpen={setIsPropertiesOpen}
            />

            {/* Hint for text tool */}
            {selectedTool === 'text' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/60 text-sm animate-pulse">
                    Click anywhere on the canvas to add text
                </div>
            )}
        </div>
    );
}