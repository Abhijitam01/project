import {
  Circle,
  Eraser,
  HandIcon,
  Image,
  Pencil,
  RectangleHorizontalIcon,
  Slash,
  MousePointer2,
  ArrowUpRight,
  Diamond,
  Triangle,
  Type,
} from "lucide-react"
import { ToolButton } from "./ToolButton"
import { Tool } from "@/canvas/Canvas"
import { ReactNode } from "react"
import { Separator } from "@repo/ui/separator"

interface ToolbarProps {
  activeTool: Tool
  setActiveTool: (s: Tool) => void
  toolLocked: boolean
  setToolLocked: (next: boolean) => void
}

export const Toolbar = ({ activeTool, setActiveTool, toolLocked, setToolLocked }: ToolbarProps) => {
  const groups: { tool: Tool; icon: ReactNode; shortcut: string; badge: string }[][] = [
    [
      { tool: "select", icon: <MousePointer2 className="h-4 w-4" />, shortcut: "V", badge: "1" },
      { tool: "grab", icon: <HandIcon className="h-4 w-4" />, shortcut: "H", badge: "2" },
    ],
    [
      { tool: "rect", icon: <RectangleHorizontalIcon className="h-4 w-4" />, shortcut: "R", badge: "3" },
      { tool: "ellipse", icon: <Circle className="h-4 w-4" />, shortcut: "O", badge: "4" },
      { tool: "arrow", icon: <ArrowUpRight className="h-4 w-4" />, shortcut: "A", badge: "5" },
      { tool: "line", icon: <Slash className="h-4 w-4" />, shortcut: "L", badge: "6" },
      { tool: "pencil", icon: <Pencil className="h-4 w-4" />, shortcut: "P", badge: "7" },
      { tool: "text", icon: <Type className="h-4 w-4" />, shortcut: "T", badge: "8" },
      { tool: "diamond", icon: <Diamond className="h-4 w-4" />, shortcut: "D", badge: "9" },
      { tool: "triangle", icon: <Triangle className="h-4 w-4" />, shortcut: "G", badge: "0" },
    ],
    [
      { tool: "erase", icon: <Eraser className="h-4 w-4" />, shortcut: "E", badge: "-" },
    ],
  ]

  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1a1c24]/95 px-2 py-1.5 text-white shadow-xl backdrop-blur">
        {groups.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`} className="flex items-center gap-1">
            {group.map((item) => (
              <ToolButton
                key={item.tool}
                active={activeTool === item.tool}
                onClick={() => setActiveTool(item.tool)}
                icon={item.icon}
                shortcut={item.shortcut}
                badge={item.badge}
                tool={item.tool}
              />
            ))}
            {groupIndex < groups.length - 1 ? <Separator orientation="vertical" className="mx-1 h-7 bg-white/15" /> : null}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setToolLocked(!toolLocked)}
          className={`rounded-lg p-2 transition-colors ${
            toolLocked
              ? "bg-[#5f5fcf] text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
          title={toolLocked ? "Keep selected tool active" : "Switch to selection after draw"}
          aria-label={toolLocked ? "Disable tool lock" : "Enable tool lock"}
        >
          <Image className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-center text-[10px] text-white/40">Esc: select, Space: hand tool, Scroll/Pinch: zoom</p>
    </div>
  )
}
