import { Circle, Eraser, HandIcon, Pencil, RectangleHorizontalIcon, Slash, MousePointer2, ArrowUpRight, Diamond, Triangle, Type, Undo2, Redo2 } from "lucide-react"
import { ToolButton } from "./ToolButton"
import { Tool } from "@/canvas/Canvas"
import { ReactNode } from "react"
import { Separator } from "./ui/separator"
import { Game } from "@/render/Game"

interface ToolbarProps{
    activeTool : Tool
    setActiveTool: (s: Tool) => void
    game?: Game
}

export const Toolbar = ({activeTool, setActiveTool, game}: ToolbarProps) => {

    const tools : {tool: Tool, icon: ReactNode , shortcut: string}[] = [
    {
        tool: "select",
        icon: <MousePointer2 />,
        shortcut: "V"
    },
    {
        tool: "grab",
        icon: <HandIcon />,
        shortcut: "H"
    },
    {
        tool: "rect",
        icon: <RectangleHorizontalIcon />,
        shortcut: "R"
    },
    {
        tool: "ellipse",
        icon: <Circle />,
        shortcut: "O"
    },
    {
        tool: "diamond",
        icon: <Diamond />,
        shortcut: "D"
    },
    {
        tool: "triangle",
        icon: <Triangle />,
        shortcut: "T"
    },
    {
        tool: "line",
        icon: <Slash />,
        shortcut: "L"
    },
    {
        tool: "arrow",
        icon: <ArrowUpRight />,
        shortcut: "A"
    },
    {
        tool: "pencil",
        icon: <Pencil />,
        shortcut: "P"
    },
    {
        tool: "text",
        icon: <Type />,
        shortcut: "X"
    },
    {
        tool: "erase",
        icon: <Eraser />,
        shortcut: "E"
    }
]



    return(
        <div className="w-fit h-16 py-2 px-4 fixed top-5 left-[50%] -translate-x-[50%] z-50">
            <div className="flex bg-[#232329] px-4 py-1 rounded-md gap-2 h-full items-center">
            {tools.map((tool, index)=>
                { 
                    return (<>
                        <ToolButton 
                            key={tool.tool}
                            active={activeTool === tool.tool} 
                            onClick={()=>setActiveTool(tool.tool)} 
                            icon={tool.icon} 
                            shortcut={tool.shortcut} 
                            tool={tool.tool} 
                        />

                    {(tool.tool === "select" || tool.tool === "triangle") ? (
                        <Separator orientation="vertical" className="bg-white/20 mx-1" />
                    ): null}
                    
                    
                    </>)
                
                }
            )}

            <Separator orientation="vertical" className="bg-white/20 mx-1" />

            {/* Undo/Redo buttons */}
            <button
                onClick={() => game?.undo()}
                className="p-2 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white"
                title="Undo (Ctrl+Z)"
            >
                <Undo2 className="h-5 w-5" />
            </button>
            <button
                onClick={() => game?.redo()}
                className="p-2 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white"
                title="Redo (Ctrl+Y)"
            >
                <Redo2 className="h-5 w-5" />
            </button>
            </div>

            <p className="text-white/30 mt-1 absolute w-full mx-auto scale-[0.8] text-sm text-center">To zoom, use scroll or pinch!</p>
            
        </div>
    )
}