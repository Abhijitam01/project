import {
  Circle,
  Eraser,
  HandIcon,
  Pencil,
  RectangleHorizontalIcon,
  Slash,
  MousePointer2,
  ArrowUpRight,
  Diamond,
  Triangle,
  Type,
  Undo2,
  Redo2,
  Lock,
  Unlock,
} from "lucide-react"
import { ToolButton } from "./ToolButton"
import { Tool } from "@/canvas/Canvas"
import { ReactNode } from "react"
import { Separator } from "@repo/ui/separator"
import { Game } from "@/render/Game"

interface ToolbarProps {
  activeTool: Tool
  setActiveTool: (s: Tool) => void
  game?: Game
  toolLocked: boolean
  setToolLocked: (next: boolean) => void
}

export const Toolbar = ({ activeTool, setActiveTool, game, toolLocked, setToolLocked }: ToolbarProps) => {
  const groups: { tool: Tool; icon: ReactNode; shortcut: string }[][] = [
    [
      { tool: "select", icon: <MousePointer2 className="h-5 w-5" />, shortcut: "V" },
      { tool: "grab", icon: <HandIcon className="h-5 w-5" />, shortcut: "H" },
    ],
    [
      { tool: "rect", icon: <RectangleHorizontalIcon className="h-5 w-5" />, shortcut: "R" },
      { tool: "ellipse", icon: <Circle className="h-5 w-5" />, shortcut: "O" },
      { tool: "diamond", icon: <Diamond className="h-5 w-5" />, shortcut: "D" },
      { tool: "triangle", icon: <Triangle className="h-5 w-5" />, shortcut: "G" },
      { tool: "line", icon: <Slash className="h-5 w-5" />, shortcut: "L" },
      { tool: "arrow", icon: <ArrowUpRight className="h-5 w-5" />, shortcut: "A" },
    ],
    [
      { tool: "pencil", icon: <Pencil className="h-5 w-5" />, shortcut: "P" },
      { tool: "text", icon: <Type className="h-5 w-5" />, shortcut: "T" },
      { tool: "erase", icon: <Eraser className="h-5 w-5" />, shortcut: "E" },
    ],
  ]

  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[#1f2026]/95 px-3 py-2 text-white shadow-xl backdrop-blur">
        {groups.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`} className="flex items-center gap-2">
            {group.map((item) => (
              <ToolButton
                key={item.tool}
                active={activeTool === item.tool}
                onClick={() => setActiveTool(item.tool)}
                icon={item.icon}
                shortcut={item.shortcut}
                tool={item.tool}
              />
            ))}
            {groupIndex < groups.length - 1 ? <Separator orientation="vertical" className="mx-1 h-8 bg-white/20" /> : null}
          </div>
        ))}

        <Separator orientation="vertical" className="h-8 bg-white/20" />

        <button
          type="button"
          onClick={() => setToolLocked(!toolLocked)}
          className={`rounded-xl border p-2 transition-colors ${
            toolLocked
              ? "border-blue-400/70 bg-blue-500/20 text-white"
              : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white"
          }`}
          title={toolLocked ? "Keep selected tool active" : "Switch to selection after draw"}
          aria-label={toolLocked ? "Disable tool lock" : "Enable tool lock"}
        >
          {toolLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => game?.undo()}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
            title="Undo (Ctrl/Cmd+Z)"
            aria-label="Undo"
          >
            <Undo2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => game?.redo()}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
            title="Redo (Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y)"
            aria-label="Redo"
          >
            <Redo2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-white/45">Esc: select, Space: hand tool, Scroll/Pinch: zoom</p>
    </div>
  )
}
